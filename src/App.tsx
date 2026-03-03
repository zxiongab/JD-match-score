import React, { useState, useEffect, useRef } from 'react';
import { simplifyAnalyze, SimplifyMatchResult } from './services/gemini';
import { 
  Briefcase, 
  Building2, 
  AlertCircle, 
  Loader2,
  Settings,
  Globe,
  MoreHorizontal,
  Upload,
  FileText,
  X,
  Search,
  ChevronDown,
  Info,
  ExternalLink,
  Bookmark,
  Share2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock LinkedIn Data
const MOCK_JOBS = [
  {
    id: 1,
    title: "Utility Locator",
    company: "Pavlov Media Inc",
    location: "Frankfort, IL (On-site)",
    salary: "$19/hr - $24/hr · 401(k) benefit",
    posted: "2 weeks ago",
    alumni: "5 company alumni work here",
    status: "Be an early applicant",
    logo: "https://logo.clearbit.com/pavlovmedia.com",
    jd: "Our Underground Utility Locators are responsible, self-motivated individuals who enjoy the freedom of working outdoors (in all weather conditions). The right individual who is committed to safety, comfortable working on their own, pays close attention to detail, and takes pride in completing a job well done. Utility locators are responsible for pinpointing the paths of Fiber Optic cables, and other conduits that carry utilities underground. The locators' efforts protect underground utilities from damage during projects..."
  },
  {
    id: 2,
    title: "Utility Locator",
    company: "USIC",
    location: "McHenry, IL (On-site)",
    salary: "$21/hr - $33/hr · 401(k) benefit",
    posted: "2 weeks ago",
    alumni: "4 company alumni work here",
    status: "Be an early applicant",
    logo: "https://logo.clearbit.com/usicllc.com",
    jd: "USIC is looking for Utility Locators to join our team. You will be responsible for locating underground utilities using specialized equipment. Requirements: High school diploma, valid driver's license, ability to work outdoors, and strong attention to detail. We offer competitive pay and benefits including 401(k)."
  },
  {
    id: 3,
    title: "Repair Specialist",
    company: "Safelite",
    location: "Chicago, IL (On-site)",
    salary: "$20/hr + benefits",
    posted: "6 days ago",
    alumni: "4 company alumni work here",
    status: "Be an early applicant",
    logo: "https://logo.clearbit.com/safelite.com",
    jd: "As a Repair Specialist at Safelite, you will be responsible for repairing vehicle glass. We provide full training. Requirements: Customer service mindset, manual dexterity, and willingness to learn. Great benefits and career growth opportunities available."
  }
];

export default function App() {
  const [resumeText, setResumeText] = useState(localStorage.getItem('user_resume_text') || '');
  const [resumeFileName, setResumeFileName] = useState(localStorage.getItem('user_resume_filename') || '');
  const [isParsing, setIsParsing] = useState(false);
  const [view, setView] = useState<'linkedin' | 'settings'>('linkedin');
  const [selectedJobId, setSelectedJobId] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedJob = MOCK_JOBS.find(j => j.id === selectedJobId) || MOCK_JOBS[0];

  const extractTextFromPDF = async (file: File) => {
    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      setResumeText(fullText);
      setResumeFileName(file.name);
      localStorage.setItem('user_resume_text', fullText);
      localStorage.setItem('user_resume_filename', file.name);
      setView('linkedin');
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to parse PDF.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === 'application/pdf') extractTextFromPDF(file);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] text-slate-900 font-sans">
      {/* LinkedIn Nav Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-14 flex items-center justify-center">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0a66c2] rounded flex items-center justify-center text-white font-bold text-xl">in</div>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-[#edf3f8] rounded py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-slate-400"
                readOnly
              />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => setView('linkedin')} className={cn("flex flex-col items-center text-slate-500 hover:text-slate-900", view === 'linkedin' && "text-slate-900")}>
              <Briefcase className="w-6 h-6" />
              <span className="text-[10px] mt-1">Jobs</span>
            </button>
            <button onClick={() => setView('settings')} className={cn("flex flex-col items-center text-slate-500 hover:text-slate-900", view === 'settings' && "text-slate-900")}>
              <Settings className="w-6 h-6" />
              <span className="text-[10px] mt-1">Settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-4 px-4">
        {view === 'settings' ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4">Extension Settings</h2>
              <div 
                onClick={() => !isParsing && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
                  resumeFileName ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                {isParsing ? <Loader2 className="w-10 h-10 animate-spin text-slate-400" /> : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="font-bold">{resumeFileName || "Upload PDF Resume"}</p>
                    <p className="text-sm text-slate-500">Simplify-style matching requires your CV</p>
                  </>
                )}
              </div>
              {resumeFileName && (
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 text-xs text-red-500 hover:underline">Clear Resume</button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-[calc(100vh-100px)]">
            {/* Left Column: Job List */}
            <div className="w-1/3 bg-white rounded-lg border border-slate-200 overflow-y-auto">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-bold text-sm">99+ results · Chicago, IL (50 mi)</h2>
              </div>
              {MOCK_JOBS.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJobId(job.id)}
                  className={cn(
                    "p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors relative",
                    selectedJobId === job.id && "bg-[#edf3f8] border-l-4 border-l-slate-900"
                  )}
                >
                  <div className="flex space-x-3">
                    <img src={job.logo} className="w-12 h-12 rounded border border-slate-100 object-contain bg-white p-1" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#0a66c2] hover:underline truncate">{job.title}</h3>
                      <p className="text-xs text-slate-900">{job.company}</p>
                      <p className="text-xs text-slate-500">{job.location}</p>
                      <p className="text-xs text-slate-500 mt-1">{job.salary}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <img src="https://api.dicebear.com/7.x/initials/svg?seed=IBM" className="w-4 h-4 rounded" />
                        <span className="text-[10px] text-slate-500">{job.alumni}</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">{job.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Job Details */}
            <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-y-auto relative">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedJob.title}</h2>
                    <p className="text-sm text-slate-900">{selectedJob.company} · {selectedJob.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] rounded-full font-bold text-sm hover:bg-blue-50">Save</button>
                    <button className="px-6 py-1.5 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-[#004182] flex items-center">
                      Apply <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-full"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* SIMPLIFY INJECTED UI */}
                <SimplifyInjectedUI resume={resumeText} jd={selectedJob.jd} />

                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">About the job</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.jd}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-bold mb-4">Benefits found in job post</h3>
                  <div className="text-sm text-slate-700">401(k)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SimplifyInjectedUI({ resume, jd }: { resume: string, jd: string }) {
  const [analysis, setAnalysis] = useState<SimplifyMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resume && jd) {
      const run = async () => {
        setLoading(true);
        const res = await simplifyAnalyze(resume, jd);
        setAnalysis(res);
        setLoading(false);
      };
      run();
    } else {
      setAnalysis(null);
    }
  }, [resume, jd]);

  if (!resume) return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-4 flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
          <Upload className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold">Simplify Match</p>
          <p className="text-xs text-slate-500">Upload your CV in settings to see matching</p>
        </div>
      </div>
      <img src="https://simplify.jobs/favicon.ico" className="w-6 h-6 grayscale opacity-50" />
    </div>
  );

  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg overflow-hidden mb-6 flex animate-in fade-in duration-500">
      {/* Left: Score Circle */}
      <div className="w-24 bg-[#0a66c2]/5 flex items-center justify-center p-4 border-r border-slate-200">
        {loading ? <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" /> : (
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (176 * (analysis?.score || 0)) / 100} strokeLinecap="round" className="text-[#0a66c2] transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{analysis?.score}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Middle: Match Info */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold">Resume Match</h4>
          <div className="flex space-x-1">
            <span className="px-1.5 py-0.5 bg-slate-200 text-[8px] font-bold rounded">V1</span>
            <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold rounded text-slate-400">V2</span>
          </div>
        </div>
        
        {loading ? <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" /> : (
          <>
            <p className="text-xs text-slate-700">
              <span className="text-[#0a66c2] font-bold">{analysis?.matchedKeywords} of {analysis?.totalKeywords} keywords</span> are present in your resume
            </p>
            <div className="flex items-center mt-2 text-[10px] text-slate-500">
              <Sparkles className="w-3 h-3 mr-1 text-[#0a66c2]" />
              Uses advanced AI matching
            </div>
          </>
        )}
      </div>

      {/* Right: Brand */}
      <div className="w-32 flex items-center justify-center border-l border-slate-200 bg-white">
        <div className="flex items-center space-x-1.5">
          <img src="https://simplify.jobs/favicon.ico" className="w-4 h-4" />
          <span className="text-sm font-bold tracking-tight text-[#0a66c2]">Simplify</span>
        </div>
      </div>
    </div>
  );
}
