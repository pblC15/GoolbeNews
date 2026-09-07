import slugify from 'slugify'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../models/categoryModel.js'
const makeSlug = s => slugify(s || '', { lower:true, strict:true, locale:'pt' })
export async function getAll(req,res){res.json(await listCategories(req.db))}
export async function create(req,res){
  const name=String(req.body?.name||'').trim(); if(!name) return res.status(400).json({error:'Nome obrigatório'})
  try { const id=await createCategory(req.db,{name,slug:makeSlug(req.body?.slug||name)}); res.status(201).json({id}) } catch(e){ res.status(e?.code==='ER_DUP_ENTRY'?409:500).json({error:e?.code==='ER_DUP_ENTRY'?'Categoria/slug já existe':'Erro ao criar categoria'}) }
}
export async function update(req,res){
  const id=Number(req.params.id), name=String(req.body?.name||'').trim(); if(!id||!name) return res.status(400).json({error:'Dados inválidos'})
  await updateCategory(req.db,id,{name,slug:makeSlug(req.body?.slug||name)}); res.json({ok:true})
}
export async function remove(req,res){
  const id=Number(req.params.id); const [[row]]=await req.db.query('SELECT COUNT(*) total FROM posts WHERE category_id=?',[id]);
  if(Number(row.total)>0) return res.status(409).json({error:'A categoria possui notícias. Mova ou remova essas notícias primeiro.'})
  await deleteCategory(req.db,id); res.json({ok:true})
}
