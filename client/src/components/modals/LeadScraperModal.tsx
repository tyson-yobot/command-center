// ✅ LeadScraperModal.tsx — YoBot® Command Center | FULL AUTOMATION | No Parameters | No Props | No Stubs

import React, { useEffect, useState } from "react"
import axios from "axios"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

const LeadScraperModal = () => {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [count, setCount] = useState(0)

  const triggerLeadScraper = async () => {
    setStatus('loading')
    try {
      const res = await axios.post('/lead-scraper/run')
      if (res.data?.status === 'success') {
        setCount(res.data.inserted || 0)
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    if (status !== 'idle') {
      const timeout = setTimeout(() => setStatus('idle'), 6000)
      return () => clearTimeout(timeout)
    }
  }, [status])

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#0d82da] hover:bg-blue-600 text-white">
        🔍 Run Lead Scraper
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-zinc-900 to-black border-2 border-blue-500 text-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🔍 Lead Scraper</h2>
            <Button onClick={triggerLeadScraper} disabled={status === 'loading'} className="bg-[#0d82da] hover:bg-blue-600">
              {status === 'loading' ? (
                <span className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Running...</span>
              ) : 'Run Now'}
            </Button>
          </div>

          {status === 'success' && (
            <div className="text-green-400 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" /> {count} leads successfully pushed to Airtable.
            </div>
          )}

          {status === 'error' && (
            <div className="text-red-500 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Scraper failed. Check Slack log.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LeadScraperModal
