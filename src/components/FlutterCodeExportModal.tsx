import React, { useState } from 'react';
import { X, Code, Copy, Check, Smartphone, FileCode } from 'lucide-react';

interface FlutterCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FLUTTER_FILES = {
  'pubspec.yaml': `name: vivah_matrimony
description: Vivah - Modern Matrimony Flutter Application for iOS and Android
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.3.0
  google_fonts: ^6.1.0
  provider: ^6.1.1
  cached_network_image: ^3.3.1
  lucide_icons: ^0.257.0
  flutter_animate: ^4.5.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,

  'main.dart': `import 'package:flutter/material';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL', defaultValue: 'YOUR_SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'YOUR_ANON_KEY'),
  );

  runApp(const VivahApp());
}

class VivahApp extends StatelessWidget {
  const VivahApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vivah Matrimony',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF881337), // Rose 900
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
      ),
      home: const VivahHomeScreen(),
    );
  }
}

class VivahHomeScreen extends StatefulWidget {
  const VivahHomeScreen({super.key});

  @override
  State<VivahHomeScreen> createState() => _VivahHomeScreenState();
}

class _VivahHomeScreenState extends State<VivahHomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vivah Matrimony', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF4C0519),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          )
        ],
      ),
      body: Center(
        child: Text('Vivah Flutter Navigation Tab $_selectedIndex'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: 'Matches'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.bookmark_border), label: 'Saved'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
`,

  'supabase_service.dart': `import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseMatrimonyService {
  final _supabase = Supabase.instance.client;

  // Fetch Candidates from Supabase
  Future<List<Map<String, dynamic>>> fetchCandidates({String? gender}) async {
    final query = _supabase.from('profiles').select('*');
    if (gender != null && gender != 'All') {
      query.eq('gender', gender);
    }
    final data = await query;
    return List<Map<String, dynamic>>.from(data);
  }

  // Send Interest
  Future<void> sendInterest(String receiverProfileId) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    await _supabase.from('connection_requests').insert({
      'sender_id': userId,
      'receiver_id': receiverProfileId,
      'status': 'pending',
    });
  }

  // Realtime Chat Listener
  Stream<List<Map<String, dynamic>>> getChatStream(String matchId) {
    return _supabase
        .from('chat_messages')
        .stream(primaryKey: ['id'])
        .eq('match_id', matchId)
        .order('created_at', ascending: true);
  }
}
`
};

export const FlutterCodeExportModal: React.FC<FlutterCodeExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeFile, setActiveFile] = useState<keyof typeof FLUTTER_FILES>('main.dart');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FLUTTER_FILES[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-rose-900/60 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-4 border-b border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-serif font-bold text-amber-100">
              Flutter App Code Exporter (iOS & Android)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs overflow-x-auto">
          {Object.keys(FLUTTER_FILES).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName as any)}
              className={`py-2.5 px-4 font-mono font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                activeFile === fileName
                  ? 'border-amber-400 text-amber-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fileName}</span>
            </button>
          ))}
        </div>

        {/* Code View */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">lib/{activeFile}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Code!' : 'Copy File'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto max-h-96">
            {FLUTTER_FILES[activeFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};
