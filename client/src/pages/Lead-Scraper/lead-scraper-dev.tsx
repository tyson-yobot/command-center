// DEVELOPMENT VERSION - FOR TESTING ONLY
// Do not deploy without approval

import React, { useState } from 'react';
import { ArrowLeft, Target, Globe, Users, Brain, Shield, BarChart3, Play, Settings, CheckCircle, Download, ExternalLink, Slack, Plus, Info } from 'lucide-react';
import robotHeadImage from '@assets/A_flat_vector_illustration_features_a_robot_face_i_1750274873156.png';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// DEV VERSION - Testing purposes only
export default function LeadScraperDashboardDev() {
  // Development component for testing changes
  return (
    <div className="min-h-screen bg-red-900/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>DEVELOPMENT VERSION</strong> - This is for testing only. Do not use in production.
        </div>
        <p className="text-white">Use this file to test changes before applying to the main lead-scraper.tsx file.</p>
      </div>
    </div>
  );
}