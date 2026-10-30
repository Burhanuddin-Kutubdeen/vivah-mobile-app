import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:uuid/uuid.dart';

class LocalMessage {
  final String id; // Client-generated UUID idempotency key
  final String conversationId;
  final String senderId;
  final String ciphertext;
  final String nonce;
  final String status; // 'sending', 'sent', 'delivered', 'read', 'failed'
  final int createdAt; // Unix timestamp ms

  LocalMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.ciphertext,
    required this.nonce,
    required this.status,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'conversation_id': conversationId,
      'sender_id': senderId,
      'ciphertext': ciphertext,
      'nonce': nonce,
      'status': status,
      'created_at': createdAt,
    };
  }

  factory LocalMessage.fromMap(Map<String, dynamic> map) {
    return LocalMessage(
      id: map['id'],
      conversationId: map['conversation_id'],
      senderId: map['sender_id'],
      ciphertext: map['ciphertext'],
      nonce: map['nonce'],
      status: map['status'],
      createdAt: map['created_at'],
    );
  }
}

class LocalMessageQueueDatabase {
  static Database? _db;

  static Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDb();
    return _db!;
  }

  static Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'vivah_chat_queue.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE local_messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            ciphertext TEXT NOT NULL,
            nonce TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        ''');
        await db.execute('''
          CREATE INDEX idx_conversation_created
          ON local_messages(conversation_id, created_at)
        ''');
      },
    );
  }

  static Future<void> enqueueMessage(LocalMessage message) async {
    final db = await database;
    await db.insert(
      'local_messages',
      message.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<void> updateStatus(String id, String newStatus) async {
    final db = await database;
    await db.update(
      'local_messages',
      {'status': newStatus},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  static Future<List<LocalMessage>> getPendingMessages() async {
    final db = await database;
    final maps = await db.query(
      'local_messages',
      where: 'status = ? OR status = ?',
      whereArgs: ['sending', 'failed'],
      orderBy: 'created_at ASC',
    );
    return maps.map((m) => LocalMessage.fromMap(m)).toList();
  }

  static Future<List<LocalMessage>> getPaginatedMessages(
    String conversationId, {
    int limit = 30,
    int? beforeTimestamp,
  }) async {
    final db = await database;
    String whereClause = 'conversation_id = ?';
    List<dynamic> whereArgs = [conversationId];

    if (beforeTimestamp != null) {
      whereClause += ' AND created_at < ?';
      whereArgs.add(beforeTimestamp);
    }

    final maps = await db.query(
      'local_messages',
      where: whereClause,
      whereArgs: whereArgs,
      orderBy: 'created_at DESC',
      limit: limit,
    );

    return maps.map((m) => LocalMessage.fromMap(m)).toList();
  }
}
