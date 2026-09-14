import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request,{params}:{params:Promise<{auditId:string}>}){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Authentication required.'},{status:401})
  const {auditId}=await params
  const {data,error}=await supabase.from('audits').select('id,domain,store_url,status,current_stage,overall_score,started_at,completed_at,failed_at,error_code,error_message,created_at,updated_at,reports(id)').eq('id',auditId).eq('user_id',user.id).single()
  if(error||!data)return NextResponse.json({error:'Audit not found.'},{status:404})
  const report=Array.isArray(data.reports)?data.reports[0]??null:data.reports
  return NextResponse.json({audit:{...data,reports:undefined,reportId:report?.id??null}})
}
