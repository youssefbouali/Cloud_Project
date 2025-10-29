const KEY = 'fittrack:data:v1'

export function loadData(){
  try{
    if(typeof window === 'undefined') return null
    const raw = localStorage.getItem(KEY)
    if(!raw) return null
    return JSON.parse(raw)
  }catch(err){
    console.error('loadData error', err)
    return null
  }
}

export function saveData(data){
  try{
    if(typeof window === 'undefined') return
    localStorage.setItem(KEY, JSON.stringify(data))
  }catch(err){
    console.error('saveData error', err)
  }
}
