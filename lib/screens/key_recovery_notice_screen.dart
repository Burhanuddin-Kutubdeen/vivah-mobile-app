import 'package:flutter/material.dart';

class KeyRecoveryNoticeScreen extends StatelessWidget {
  final VoidCallback onRestoreFromPassphrase;
  final VoidCallback onStartFresh;

  const KeyRecoveryNoticeScreen({
    super.key,
    required this.onRestoreFromPassphrase,
    required this.onStartFresh,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Encryption Key Status')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.security, size: 56, color: Colors.rose),
            const SizedBox(height: 16),
            const Text(
              'Encryption Key Missing',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const Text(
              'We detected that your local private encryption key is not present on this device. '
              'Because chat messages are end-to-end encrypted (E2EE), your private key never leaves your device.\n\n'
              'Please choose how you would like to proceed:',
              style: TextStyle(fontSize: 14, color: Colors.black80, height: 1.4),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.lock_reset),
              label: const Text('Restore from Passphrase Backup'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
              ),
              onPressed: onRestoreFromPassphrase,
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.refresh),
              label: const Text('Start Fresh (Generate New Key Pair)'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                foregroundColor: Colors.redAccent,
              ),
              onPressed: onStartFresh,
            ),
            const Spacer(),
            const Divider(),
            const SizedBox(height: 8),
            const Text(
              'SERVER METADATA VISIBILITY & LIMITS:\n'
              '• Visible to Server: Who talks to whom (sender_id, conversation_id), message timestamps, and ciphertext length.\n'
              '• Hidden from Server: Message content (text/media) is encrypted end-to-end with AES-256-GCM and cannot be decrypted by Supabase or Vivah servers.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
