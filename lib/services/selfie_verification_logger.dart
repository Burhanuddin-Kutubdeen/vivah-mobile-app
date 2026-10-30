import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/selfie_verification_failure.dart';

class SelfieVerificationLogger {
  final SupabaseClient? _supabase;

  SelfieVerificationLogger([this._supabase]);

  /// Log error to console and remote Supabase `error_logs` table.
  /// Never shows raw exception text or stack traces to the user.
  Future<void> logError({
    required SelfieVerificationFailure failure,
    required String requestId,
    Object? rawError,
    StackTrace? stackTrace,
  }) async {
    final failureType = failure.runtimeType.toString();
    final logMessage = failure.userMessage;

    // 1. Console Logging with timing and request ID
    if (kDebugMode) {
      print('================ [SELFIE VERIFICATION ERROR LOG] ================');
      print('Request ID  : $requestId');
      print('Failure Type: $failureType');
      print('Message     : $logMessage');
      if (rawError != null) print('Raw Error   : $rawError');
      if (stackTrace != null) print('Stack Trace :\n$stackTrace');
      print('================================================================');
    }

    // 2. Persist to Supabase `error_logs` table
    try {
      final client = _supabase ?? Supabase.instance.client;
      await client.from('error_logs').insert({
        'request_id': requestId,
        'error_type': failureType,
        'message': logMessage,
        'raw_error': rawError?.toString(),
        'stack_trace': stackTrace?.toString(),
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      if (kDebugMode) {
        print('Failed to write error to Supabase error_logs: $e');
      }
    }
  }
}
