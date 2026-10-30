import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/selfie_verification_failure.dart';
import '../services/image_compressor.dart';
import '../services/local_face_detector_service.dart';
import '../services/selfie_verification_logger.dart';
import '../services/supabase_edge_proxy_service.dart';
import 'key_recovery_notice_screen.dart';

class SelfieVerificationScreen extends StatefulWidget {
  final String userId;
  final String profilePhotoUrl;
  final VoidCallback onVerificationSuccess;

  const SelfieVerificationScreen({
    super.key,
    required this.userId,
    required this.profilePhotoUrl,
    required this.onVerificationSuccess,
  });

  @override
  State<SelfieVerificationScreen> createState() => _SelfieVerificationScreenState();
}

class _SelfieVerificationScreenState extends State<SelfieVerificationScreen> {
  final LocalFaceDetectorService _localDetector = LocalFaceDetectorService();
  final SupabaseEdgeProxyService _edgeProxyService = SupabaseEdgeProxyService();
  final SelfieVerificationLogger _logger = SelfieVerificationLogger();
  final SupabaseClient _supabase = Supabase.instance.client;

  bool _isSubmitting = false;
  String _currentStepText = "";
  SelfieVerificationFailure? _currentFailure;
  bool _queuedForManualReview = false;

  // Timing stage metrics
  final Map<String, int> _stageDurationsMs = {};

  @override
  void dispose() {
    _localDetector.dispose();
    super.dispose();
  }

  void _resetState() {
    setState(() {
      _isSubmitting = false;
      _currentStepText = "";
      _currentFailure = null;
      _queuedForManualReview = false;
      _stageDurationsMs.clear();
    });
  }

  Future<void> _startVerificationFlow(Uint8List rawSelfieBytes, InputImage inputImage) async {
    if (_isSubmitting) return; // Prevent double submit

    final requestId = DateTime.now().millisecondsSinceEpoch.toString();

    setState(() {
      _isSubmitting = true;
      _currentFailure = null;
      _queuedForManualReview = false;
      _currentStepText = "Checking photo...";
    });

    try {
      // 20s overall timeout safeguard
      await Future.any([
        _runPipeline(rawSelfieBytes, inputImage, requestId),
        Future.delayed(const Duration(seconds: 20)).then((_) {
          throw const ServiceTimeout();
        }),
      ]);
    } on SelfieVerificationFailure catch (failure, st) {
      await _logger.logError(
        failure: failure,
        requestId: requestId,
        stackTrace: st,
      );
      setState(() {
        _isSubmitting = false;
        _currentFailure = failure;
        _currentStepText = "";
      });
    } catch (e, st) {
      final failure = UnknownFailure(e.toString());
      await _logger.logError(
        failure: failure,
        requestId: requestId,
        rawError: e,
        stackTrace: st,
      );
      setState(() {
        _isSubmitting = false;
        _currentFailure = failure;
        _currentStepText = "";
      });
    }
  }

  Future<void> _runPipeline(
    Uint8List rawSelfieBytes,
    InputImage inputImage,
    String requestId,
  ) async {
    final totalStopwatch = Stopwatch()..start();

    // Stage 1: On-device face detection
    final sw1 = Stopwatch()..start();
    final localCheckFailure = await _localDetector.validateLocalFace(inputImage);
    sw1.stop();
    _stageDurationsMs['on_device_face_check'] = sw1.elapsedMilliseconds;

    if (localCheckFailure != null) {
      throw localCheckFailure;
    }

    // Stage 2: On-device image compression in an isolate
    setState(() {
      _currentStepText = "Verifying...";
    });

    final sw2 = Stopwatch()..start();
    final compressedBytes = await ImageCompressor.compressImageInIsolate(rawSelfieBytes);
    sw2.stop();
    _stageDurationsMs['image_compression_isolate'] = sw2.elapsedMilliseconds;

    // Stage 3: Parallel upload to Supabase Storage and AI Call via Supabase Edge Function
    final sw3 = Stopwatch()..start();
    final String selfieBase64 = Uri.dataFromBytes(compressedBytes, mimeType: 'image/jpeg').toString();
    final fileName = '${widget.userId}_${DateTime.now().millisecondsSinceEpoch}.jpg';

    // Execute upload to Supabase Storage and AI call in parallel
    final uploadFuture = _supabase.storage.from('selfies').uploadBinary(
      fileName,
      compressedBytes,
      fileOptions: const FileOptions(contentType: 'image/jpeg'),
    );

    final aiFuture = _edgeProxyService.verifyFaceViaEdgeFunction(
      profilePhotoUrl: widget.profilePhotoUrl,
      selfieBase64: selfieBase64,
    );

    final results = await Future.wait([
      uploadFuture.catchError((err) => 'upload_failed'),
      aiFuture,
    ]);

    sw3.stop();
    _stageDurationsMs['parallel_upload_and_ai_call'] = sw3.elapsedMilliseconds;

    totalStopwatch.stop();
    _stageDurationsMs['total_flow'] = totalStopwatch.elapsedMilliseconds;

    print("=== Selfie Verification Stage Timings (ms) ===");
    _stageDurationsMs.forEach((stage, duration) {
      print("$stage: ${duration}ms");
    });

    final aiResult = results[1] as Map<String, dynamic>;
    final bool isRealPerson = aiResult['is_real_person'] ?? false;
    final double matchScore = aiResult['face_match_score'] ?? 0.0;

    if (!isRealPerson) {
      throw const NoFaceDetected();
    }

    // Fallback: If score is borderline (40% - 69%), queue for manual review rather than rejecting
    if (matchScore >= 40.0 && matchScore < 70.0) {
      await _supabase.from('profiles').update({
        'selfie_verified': false,
        'verification_status': 'manual_review',
        'verification_score': matchScore,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', widget.userId);

      setState(() {
        _isSubmitting = false;
        _queuedForManualReview = true;
        _currentStepText = "";
      });
      return;
    }

    if (matchScore < 40.0) {
      throw const FaceNotMatchingProfilePhoto();
    }

    // Save successful verification result in Supabase
    await _supabase.from('profiles').update({
      'selfie_verified': true,
      'verification_status': 'approved',
      'verification_score': matchScore,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', widget.userId);

    // Success
    setState(() {
      _isSubmitting = false;
      _currentStepText = "";
    });
    widget.onVerificationSuccess();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Selfie Verification')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_isSubmitting) ...[
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                _currentStepText,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ] else if (_queuedForManualReview) ...[
              const Icon(Icons.rate_review, size: 48, color: Colors.amber),
              const SizedBox(height: 12),
              const Text(
                'Verification Under Review',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your selfie is borderline and has been queued for manual review by our team. You can continue using the app while we review it.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black70),
              ),
            ] else if (_currentFailure != null) ...[
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              Text(
                _currentFailure!.userMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: Colors.redAccent),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: _resetState,
                    child: const Text('Try again'),
                  ),
                  if (_currentFailure!.hasOpenSettingsAction) ...[
                    const SizedBox(width: 12),
                    OutlinedButton(
                      onPressed: () {
                        // Action to open app system settings
                      },
                      child: const Text('Open Settings'),
                    ),
                  ],
                ],
              ),
            ] else ...[
              const Text('Center your face in the camera frame to complete verification.'),
            ],
          ],
        ),
      ),
    );
  }
}
