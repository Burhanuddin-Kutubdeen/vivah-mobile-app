import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'local_message_queue_database.dart';

class RealtimeChatService {
  final SupabaseClient _supabase;
  RealtimeChannel? _channel;
  StreamSubscription? _connectivitySubscription;
  final String conversationId;
  final String currentUserId;
  final _uuid = const Uuid();

  RealtimeChatService({
    required this.conversationId,
    required this.currentUserId,
    SupabaseClient? client,
  }) : _supabase = client ?? Supabase.instance.client;

  /// Initialize Realtime subscription and auto-reconnect on drop/resume
  void initRealtimeSubscription(Function(Map<String, dynamic>) onNewMessageReceived) {
    _channel = _supabase.channel('room:$conversationId');

    _channel!.onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'messages',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'conversation_id',
        value: conversationId,
      ),
      callback: (payload) {
        final newRecord = payload.newRecord;
        onNewMessageReceived(newRecord);
      },
    ).subscribe((status, [error]) {
      if (status == RealtimeSubscribeStatus.closed || status == RealtimeSubscribeStatus.channelError) {
        // Auto-reconnect on network drops or app resume
        Future.delayed(const Duration(seconds: 3), () {
          initRealtimeSubscription(onNewMessageReceived);
        });
      }
    });

    // Automatically flush pending offline messages
    flushPendingOfflineQueue();
  }

  /// Optimistic UI send message with client-generated UUID idempotency key
  Future<LocalMessage> sendMessageOptimistically({
    required String ciphertext,
    required String nonce,
  }) async {
    final messageId = _uuid.v4(); // Client UUID idempotency key
    final nowMs = DateTime.now().millisecondsSinceEpoch;

    final localMsg = LocalMessage(
      id: messageId,
      conversationId: conversationId,
      senderId: currentUserId,
      ciphertext: ciphertext,
      nonce: nonce,
      status: 'sending',
      createdAt: nowMs,
    );

    // 1. Immediately insert into local sqflite DB (Optimistic UI)
    await LocalMessageQueueDatabase.enqueueMessage(localMsg);

    // 2. Try sending over Supabase
    _attemptSendRemote(localMsg);

    return localMsg;
  }

  Future<void> _attemptSendRemote(LocalMessage msg) async {
    try {
      await _supabase.from('messages').insert({
        'id': msg.id, // Primary key client UUID guarantees no duplicates
        'conversation_id': msg.conversationId,
        'sender_id': msg.senderId,
        'ciphertext': msg.ciphertext,
        'nonce': msg.nonce,
        'created_at': DateTime.fromMillisecondsSinceEpoch(msg.createdAt).toIso8601String(),
      });

      await LocalMessageQueueDatabase.updateStatus(msg.id, 'sent');
    } catch (e) {
      await LocalMessageQueueDatabase.updateStatus(msg.id, 'failed');
    }
  }

  /// Automatically flushes pending offline messages in order
  Future<void> flushPendingOfflineQueue() async {
    final pending = await LocalMessageQueueDatabase.getPendingMessages();
    for (final msg in pending) {
      await _attemptSendRemote(msg);
    }
  }

  /// Load paginated history (last 30 + lazy load)
  Future<List<LocalMessage>> fetchPaginatedHistory({int limit = 30, int? beforeTimestamp}) async {
    return LocalMessageQueueDatabase.getPaginatedMessages(
      conversationId,
      limit: limit,
      beforeTimestamp: beforeTimestamp,
    );
  }

  void dispose() {
    _channel?.unsubscribe();
  }
}
