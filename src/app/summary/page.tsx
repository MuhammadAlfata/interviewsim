'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useInterviewStore } from '@/store/useInterviewStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();
  const { 
    companyName, roleName, status, recordingUrl, questions, reset 
  } = useInterviewStore();

  useEffect(() => {
    if (status !== 'finished') {
      router.push('/');
    }
  }, [status, router]);

  const handleRestart = () => {
    reset();
    router.push('/');
  };

  if (status !== 'finished') return null;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10 mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Interview Completed!</h1>
          <p className="text-neutral-400 text-lg">
            Great job! You have completed the practice interview for {roleName} at {companyName}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recording Player */}
          <Card className="bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl flex flex-col">
            <CardHeader>
              <CardTitle>Session Recording</CardTitle>
              <CardDescription className="text-neutral-400">
                Review your performance, posture, and speaking pace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {recordingUrl ? (
                <div className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 aspect-video mb-4 relative">
                  <video 
                    src={recordingUrl} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-neutral-950 border border-neutral-800 aspect-video mb-4 flex items-center justify-center text-neutral-500">
                  No recording available
                </div>
              )}

              {recordingUrl && (
                <a href={recordingUrl} download="interview-recording.mp4" className="w-full mt-auto">
                  <Button variant="outline" className="w-full bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                    <Download className="w-4 h-4 mr-2" /> Download Recording
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Self Reflection */}
          <Card className="bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl">
            <CardHeader>
              <CardTitle>Questions Asked</CardTitle>
              <CardDescription className="text-neutral-400">
                Self-reflect on how you answered these questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {questions.map((q, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-neutral-200 leading-relaxed">{q}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center pb-12">
          <Button 
            onClick={handleRestart} 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-8 h-14"
          >
            <RefreshCw className="w-5 h-5 mr-2" /> Start Another Practice
          </Button>
        </div>
        
      </motion.div>
    </div>
  );
}
