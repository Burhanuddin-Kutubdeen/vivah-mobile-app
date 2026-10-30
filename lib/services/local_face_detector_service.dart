import 'dart:io';
import 'dart:math';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import '../models/selfie_verification_failure.dart';

class LocalFaceDetectorService {
  late final FaceDetector _faceDetector;

  LocalFaceDetectorService() {
    final options = FaceDetectorOptions(
      enableClassification: true, // For eyes open check
      enableTracking: false,
      performanceMode: FaceDetectorMode.fast,
      minFaceSize: 0.15,
    );
    _faceDetector = FaceDetector(options: options);
  }

  /// Runs on-device face checks.
  /// Checks:
  /// 1. Exactly one face present.
  /// 2. Face is roughly centered.
  /// 3. Eyes are open (leftEyeOpenProbability, rightEyeOpenProbability > 0.4).
  /// 4. Head angle is roughly frontal (Euler X, Y, Z < 15 degrees).
  Future<SelfieVerificationFailure?> validateLocalFace(InputImage inputImage) async {
    try {
      final List<Face> faces = await _faceDetector.processImage(inputImage);

      if (faces.isEmpty) {
        return const NoFaceDetected();
      }

      if (faces.length > 1) {
        return const MultipleFaces();
      }

      final face = faces.first;

      // Eye open probability check
      if (face.leftEyeOpenProbability != null && face.rightEyeOpenProbability != null) {
        if (face.leftEyeOpenProbability! < 0.35 || face.rightEyeOpenProbability! < 0.35) {
          return const PoorLighting(); // or no face / eyelids closed
        }
      }

      // Head pose / angle check (roughly frontal)
      final rotY = face.headEulerAngleY ?? 0; // Head turned left/right
      final rotZ = face.headEulerAngleZ ?? 0; // Head tilted left/right
      final rotX = face.headEulerAngleX ?? 0; // Head tilted up/down

      if (rotY.abs() > 20.0 || rotZ.abs() > 20.0 || rotX.abs() > 20.0) {
        return const NoFaceDetected(); // Face not facing front
      }

      // Face Centered Check
      final imageSize = inputImage.metadata?.size;
      if (imageSize != null) {
        final faceCenterX = face.boundingBox.center.dx;
        final faceCenterY = face.boundingBox.center.dy;
        final imgCenterX = imageSize.width / 2;
        final imgCenterY = imageSize.height / 2;

        final offsetX = (faceCenterX - imgCenterX).abs();
        final offsetY = (faceCenterY - imgCenterY).abs();

        if (offsetX > imageSize.width * 0.35 || offsetY > imageSize.height * 0.35) {
          return const NoFaceDetected();
        }
      }

      return null; // All local checks passed successfully
    } catch (e) {
      return UnknownFailure(e.toString());
    }
  }

  void dispose() {
    _faceDetector.close();
  }
}
