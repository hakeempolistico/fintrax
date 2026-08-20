'use client'
import { Account, Bill, Loan, Member } from '@/payload-types'
import AccountForm from '@/components/fintrax/accounts/AccountForm'
import BillForm from '@/components/fintrax/bills/BillForm'
import LoanForm from '@/components/fintrax/loans/LoanForm'
import TransactionForm from '@/components/fintrax/transactions/TransactionForm'
import AiCamera from '@/components/fintrax/capture/AiCamera'
import Button from '@/components/ui/button/Button'
import { Modal } from '@/components/ui/modal'
import { useModal } from '@/hooks/useModal'
import { Camera, Plus, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

type Props = { collection: 'accounts'|'transactions'|'loans'|'bills'; me: Member; bills?: Bill[]; accounts?: Account[]; loans?: Loan[] }
export default function ActionModals({ me, collection, bills, accounts, loans }: Props) {
 const fileInputRef=useRef<HTMLInputElement>(null); const router=useRouter(); const [isUploading,setIsUploading]=useState(false); const createModal=useModal(); const scannerModal=useModal(); const {isMobileOpen}=useSidebar()
 const config={accounts:{Form:AccountForm,endpoint:'/api/accounts'},loans:{Form:LoanForm,endpoint:'/api/loans'},bills:{Form:BillForm,endpoint:'/api/bills'},transactions:{Form:TransactionForm,endpoint:'/api/transactions'}}[collection]; const Form=config.Form
 const handleSave=async(data:any)=>{const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,member:me.id})}); const result=await response.json(); if(!response.ok){alert(result?.errors?.[0]?.message ?? 'Unable to save.'); return false} return true}
 const handleUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0]; if(!file)return; setIsUploading(true); try{const formData=new FormData();formData.append('image',file);const response=await fetch('/api/aicapture',{method:'POST',body:formData});const data=await response.json();if(!response.ok){alert(data?.message??'Failed to upload image.');return}if(data?.redirect)router.push(data.redirect)}finally{setIsUploading(false);e.target.value=''}}
 return <>{!isMobileOpen&&<><div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full bg-brand-50 p-3 dark:bg-purple-600/10"><Button size="sm" onClick={createModal.openModal} className="!rounded-full !bg-brand-100 !text-brand-500"><Plus className="h-5 w-5"/></Button><Button size="sm" onClick={scannerModal.openModal} className="!rounded-full !bg-brand-100 !text-brand-500"><Camera className="h-5 w-5"/></Button><Button size="sm" onClick={()=>fileInputRef.current?.click()} className="!rounded-full !bg-brand-100 !text-brand-500"><Upload className="h-5 w-5"/></Button><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/></div><Modal isOpen={createModal.isOpen} onClose={createModal.closeModal} className="max-w-[584px] p-5 lg:p-10"><Form closeModal={createModal.closeModal} handleSave={handleSave} bills={bills} accounts={accounts} loans={loans}/></Modal><Modal isOpen={scannerModal.isOpen} onClose={scannerModal.closeModal} className="max-w-[584px] p-5 lg:p-10"><AiCamera/></Modal></>}{isUploading&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-950/95"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500"/><h2 className="mt-6 text-lg font-semibold dark:text-white">Analyzing your document</h2><p className="mt-2 text-sm text-gray-500">This may take a moment.</p></div></div>}</>
}
