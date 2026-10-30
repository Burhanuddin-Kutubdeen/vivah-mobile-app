import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseEdgeProxyService {
  final SupabaseClient _client;

  SupabaseEdgeProxyService([SupabaseClient? client])
      : _client = client ?? Supabase.instance.client;

  /// Calls the Supabase Edge Function proxy for AI face verification.
  /// The Edge Function encapsulates the Gemini API key so it never ships in the app binary.
  /// Returns strict JSON schema: {is_real_person, face_match_score, issues[]}
  Future<Map<String, dynamic>> verifyFaceViaEdgeFunction({
    required String profilePhotoUrl,
    required String selfieBase64,
  }) async {
    final response = await _client.functions.invoke(
      'verify-face',
      body: {
        'profile_photo_url': profilePhotoUrl,
        'selfie_base64': selfieBase64,
      },
    );

    if (response.status != 200) {
      throw Exception('Edge function returned status ${response.status}');
    }

    final data = response.data;
    if (data is Map<String, dynamic>) {
      return {
        'is_real_person': data['is_real_person'] ?? false,
        'face_match_score': (data['face_match_score'] as num?)?.toDouble() ?? 0.0,
        'issues': List<String>.from(data['issues'] ?? []),
      };
    }

    throw Exception('Invalid JSON response format from Edge function');
  }
}
