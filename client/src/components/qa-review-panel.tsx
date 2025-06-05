import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Phone, Clock, User, FileText, AlertTriangle } from 'lucide-react';

interface QAReview {
  id: string;
  callId: string;
  agentName: string;
  phoneNumber: string;
  qaScore: number;
  qaComments: string;
  tags: string[];
  timestamp: string;
  transcript: string;
  flags: string;
  reviewType: string;
}

export default function QAReviewPanel() {
  const [reviews, setReviews] = useState<QAReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    call_id: '',
    agent_name: 'Tyson Lerfald',
    phone_number: '',
    transcript: '',
    qa_comments: '',
    flags: '',
    review_type: 'Post-Call'
  });

  const submitQAReview = async () => {
    if (!newReview.call_id || !newReview.transcript) {
      alert('Please fill in Call ID and Transcript');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch('/api/qa/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`QA Review submitted successfully! 
GPT Score: ${result.gptScore}%
Tags: ${result.tags.join(', ')}
PDF Generated: ${result.pdfPath}`);
        
        setNewReview({
          call_id: '',
          agent_name: 'Tyson Lerfald',
          phone_number: '',
          transcript: '',
          qa_comments: '',
          flags: '',
          review_type: 'Post-Call'
        });
      } else {
        alert(`QA Review failed: ${result.error || result.message}`);
      }
    } catch (error: any) {
      alert(`QA Review error: ${error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const testVoiceCallLog = async () => {
    setLoading(true);
    try {
      const testData = {
        caller_name: "Test Customer",
        phone: "+1-555-TEST",
        bot_name: "YoBot",
        timestamp: new Date().toISOString(),
        transcript: "Customer called asking about pricing and said thank you for the excellent service",
        outcome: "Information Provided",
        escalated: false,
        qa_score: 88,
        related_deal: "DEAL-TEST",
        location: "Test Location"
      };

      const response = await fetch('/api/voicebot/calllog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      alert(`Voice Call Log Test: ${result.success ? 'SUCCESS' : 'FAILED'}\nMessage: ${result.message}`);
    } catch (error: any) {
      alert(`Voice Call Log Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCompletePipeline = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/complete-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();
      alert(`Pipeline Test Results:
Success: ${result.success ? 'YES' : 'NO'}
Tests Passed: ${result.testsPassed}/${result.testsRun}
Errors: ${result.results.errors.join(', ') || 'None'}`);
    } catch (error: any) {
      alert(`Pipeline Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('Critical') || tag.includes('🔥')) return 'bg-red-100 text-red-800';
    if (tag.includes('Passed') || tag.includes('✅')) return 'bg-green-100 text-green-800';
    if (tag.includes('Positive') || tag.includes('🙏')) return 'bg-blue-100 text-blue-800';
    if (tag.includes('Issue') || tag.includes('🛑')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* QA Review Submission Form */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Star className="h-5 w-5 text-yellow-500" />
            Submit QA Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="call_id" className="text-gray-700 dark:text-gray-300">Call ID</Label>
              <Input
                id="call_id"
                value={newReview.call_id}
                onChange={(e) => setNewReview({...newReview, call_id: e.target.value})}
                placeholder="CALL-001"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="phone_number" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
              <Input
                id="phone_number"
                value={newReview.phone_number}
                onChange={(e) => setNewReview({...newReview, phone_number: e.target.value})}
                placeholder="+1-555-0123"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="transcript" className="text-gray-700 dark:text-gray-300">Call Transcript</Label>
            <Textarea
              id="transcript"
              value={newReview.transcript}
              onChange={(e) => setNewReview({...newReview, transcript: e.target.value})}
              placeholder="Customer called asking about pricing..."
              rows={4}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="qa_comments" className="text-gray-700 dark:text-gray-300">QA Comments</Label>
            <Textarea
              id="qa_comments"
              value={newReview.qa_comments}
              onChange={(e) => setNewReview({...newReview, qa_comments: e.target.value})}
              placeholder="Agent handled the call well but needs training on..."
              rows={3}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="flags" className="text-gray-700 dark:text-gray-300">Flags</Label>
              <Input
                id="flags"
                value={newReview.flags}
                onChange={(e) => setNewReview({...newReview, flags: e.target.value})}
                placeholder="Training Required"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="review_type" className="text-gray-700 dark:text-gray-300">Review Type</Label>
              <Input
                id="review_type"
                value={newReview.review_type}
                onChange={(e) => setNewReview({...newReview, review_type: e.target.value})}
                placeholder="Post-Call"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <Button 
            onClick={submitQAReview} 
            disabled={submitLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitLoading ? 'Submitting QA Review...' : 'Submit QA Review with GPT Scoring'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Automation Endpoints */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-blue-500" />
            Test Automation Systems
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testVoiceCallLog} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Test Voice Call Log
            </Button>
            
            <Button 
              onClick={testCompletePipeline} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Test Complete Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QA Review Features */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">QA Review Automation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">GPT-4 Auto Scoring</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Automatic QA scoring based on transcript analysis</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100">Smart Keyword Tagging</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Automatic tags based on transcript keywords</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Red Flag Escalation</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">Automatic escalation for low scores or issues</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Duplicate Detection</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Prevents duplicate QA reviews for same call</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Slack Notifications</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Automatic alerts sent to team Slack channels</p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">PDF Reports</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">Automatic PDF generation for QA reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}