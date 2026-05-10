'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useInterviewStore } from '@/store/useInterviewStore';
import { BrainCircuit, Play } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const setSetupData = useInterviewStore(state => state.setSetupData);
  const startInterviewAction = useInterviewStore(state => state.startInterview);
  
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [interviewType, setInterviewType] = useState('General');
  const [questionsRaw, setQuestionsRaw] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse questions from textarea
    const questionsList = questionsRaw
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);
      
    // Set default questions if empty
    const finalQuestions = questionsList.length > 0 
      ? questionsList 
      : [
          "Tell me about yourself.",
          "Why do you want to work here?",
          "What are your greatest strengths?",
          "Describe a time you overcame a challenge."
        ];

    // Shuffle questions
    const shuffledQuestions = [...finalQuestions].sort(() => Math.random() - 0.5);

    setSetupData({
      companyName: companyName || 'Any Company',
      roleName: roleName || 'Any Role',
      interviewType,
      questions: shuffledQuestions,
      durationMinutes
    });

    startInterviewAction();
    router.push('/interview');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="flex items-center justify-center mb-8 gap-3 text-primary">
          <BrainCircuit className="w-10 h-10" />
          <h1 className="text-4xl font-bold text-white tracking-tight">InterviewSim</h1>
        </div>
        
        <Card className="bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Configure Interview</CardTitle>
            <CardDescription className="text-neutral-400">
              Set up your simulated interview environment to start practicing.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleStart}>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-neutral-300">Company Name</Label>
                  <Input 
                    id="company" 
                    placeholder="e.g. Google, Amazon, etc." 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-neutral-300">Role Name</Label>
                  <Input 
                    id="role" 
                    placeholder="e.g. Software Engineer" 
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-neutral-300">Interview Type</Label>
                <Select value={interviewType} onValueChange={(val) => setInterviewType(val || 'General')}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white focus:ring-primary">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    <SelectItem value="General">General / Behavioral</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Scholarship">Scholarship / Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="questions" className="text-neutral-300">Questions (One per line)</Label>
                  <span className="text-xs text-neutral-500">Leave empty for defaults</span>
                </div>
                <Textarea 
                  id="questions" 
                  placeholder="Tell me about yourself.\nWhy should we hire you?\nDescribe a challenge you faced."
                  className="min-h-[120px] bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-primary"
                  value={questionsRaw}
                  onChange={(e) => setQuestionsRaw(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-300">Duration ({durationMinutes} minutes)</Label>
                </div>
                <Slider
                  value={[durationMinutes]}
                  onValueChange={(val) => setDurationMinutes(typeof val === 'number' ? val : (Array.isArray(val) ? val[0] : 15))}
                  min={5}
                  max={60}
                  step={5}
                  className="py-4"
                />
              </div>

            </CardContent>
            <CardFooter>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-md font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Start Interview
                  </>
                )}
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
