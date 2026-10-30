import 'dart:convert';
import 'dart:typed_data';
import 'package:cryptography/cryptography.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class E2EEChatService {
  final _secureStorage = const FlutterSecureStorage();
  final _supabase = Supabase.instance.client;

  final _x25519 = X25519();
  final _aesGcm = AesGcm.with256bits();

  static const _privKeyStorageKey = 'vivah_e2ee_x25519_private_key';

  /// 5. Generate per-user X25519 key pair on first login.
  /// Keep private key ONLY in flutter_secure_storage (never uploaded); store only public key in Supabase.
  Future<SimpleKeyPair> getOrCreateKeyPair(String userId) async {
    final existingPrivKeyBase64 = await _secureStorage.read(key: _privKeyStorageKey);

    if (existingPrivKeyBase64 != null) {
      final privBytes = base64Decode(existingPrivKeyBase64);
      return SimpleKeyPairData(
        privBytes,
        type: KeyPairType.x25519,
        publicKey: await _x25519.extractPublicKey(SimpleKeyPairData(privBytes, type: KeyPairType.x25519)),
      );
    }

    // Generate new X25519 key pair
    final newKeyPair = await _x25519.newKeyPair();
    final privKeyBytes = await newKeyPair.extractPrivateKeyBytes();
    final pubKey = await newKeyPair.extractPublicKey();

    // Store private key ONLY in flutter_secure_storage
    await _secureStorage.write(
      key: _privKeyStorageKey,
      value: base64Encode(privKeyBytes),
    );

    // Store ONLY public key in Supabase `user_public_keys` table
    await _supabase.from('user_public_keys').upsert({
      'user_id': userId,
      'public_key': base64Encode(pubKey.bytes),
      'created_at': DateTime.now().toIso8601String(),
    });

    return newKeyPair;
  }

  /// 6. Derive shared secret per conversation (ECDH), then encrypt each message with AES-256-GCM using unique random nonce.
  Future<Map<String, String>> encryptMessage({
    required SimpleKeyPair myKeyPair,
    required String peerUserId,
    required String plainText,
  }) async {
    // Fetch peer's public key from Supabase
    final response = await _supabase
        .from('user_public_keys')
        .select('public_key')
        .eq('user_id', peerUserId)
        .single();

    final peerPubKeyBytes = base64Decode(response['public_key']);
    final peerPublicKey = SimplePublicKey(peerPubKeyBytes, type: KeyPairType.x25519);

    // Perform ECDH shared secret derivation
    final sharedSecret = await _x25519.sharedSecretKey(
      keyPair: myKeyPair,
      remotePublicKey: peerPublicKey,
    );

    // Encrypt plaintext with AES-256-GCM using unique random nonce
    final secretBox = await _aesGcm.encrypt(
      utf8.encode(plainText),
      secretKey: sharedSecret,
    );

    return {
      'ciphertext': base64Encode(secretBox.cipherText + secretBox.mac.bytes),
      'nonce': base64Encode(secretBox.nonce),
    };
  }

  /// Decrypt incoming message using derived ECDH shared secret + AES-256-GCM nonce
  Future<String> decryptMessage({
    required SimpleKeyPair myKeyPair,
    required String peerUserId,
    required String ciphertextBase64,
    required String nonceBase64,
  }) async {
    final response = await _supabase
        .from('user_public_keys')
        .select('public_key')
        .eq('user_id', peerUserId)
        .single();

    final peerPubKeyBytes = base64Decode(response['public_key']);
    final peerPublicKey = SimplePublicKey(peerPubKeyBytes, type: KeyPairType.x25519);

    final sharedSecret = await _x25519.sharedSecretKey(
      keyPair: myKeyPair,
      remotePublicKey: peerPublicKey,
    );

    final rawCipherAndMac = base64Decode(ciphertextBase64);
    final nonce = base64Decode(nonceBase64);

    // Separate cipherText and 16-byte MAC
    final cipherText = rawCipherAndMac.sublist(0, rawCipherAndMac.length - 16);
    final macBytes = rawCipherAndMac.sublist(rawCipherAndMac.length - 16);

    final secretBox = SecretBox(
      cipherText,
      nonce: nonce,
      mac: Mac(macBytes),
    );

    final clearBytes = await _aesGcm.decrypt(
      secretBox,
      secretKey: sharedSecret,
    );

    return utf8.decode(clearBytes);
  }

  /// 7. Key loss / reinstall handling: Check if private key exists in secure storage
  Future<bool> hasStoredPrivateKey() async {
    final key = await _secureStorage.read(key: _privKeyStorageKey);
    return key != null;
  }
}
