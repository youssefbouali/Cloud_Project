import { useState } from 'react'
import { useData } from '../context/DataContext'

export default function ActivityForm(){
  const { addActivity, user } = useData()
  const [type, setType] = useState('Course')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [photo, setPhoto] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!date || !duration) return
    const activity = {
      type,
      date,
      duration: Number(duration),
      distance: distance ? Number(distance) : 0,
      photo,
      owner: user?.id || null
    }
    addActivity(activity)
    // reset
    setType('Course'); setDate(''); setDuration(''); setDistance(''); setPhoto(null)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="label">Type
        <select className="select" value={type} onChange={e => setType(e.target.value)}>
          <option>Course</option>
          <option>Marche</option>
          <option>Vélo</option>
          <option>Natation</option>
          <option>Gym</option>
        </select>
      </label>

      <label className="label">Date
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>

      <label className="label">Durée (minutes)
        <input className="input" type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)} required />
      </label>

      <label className="label">Distance (km)
        <input className="input" type="number" step="0.01" min="0" value={distance} onChange={e => setDistance(e.target.value)} />
      </label>

      <label className="label">Photo
        <input className="input" type="file" accept="image/*" onChange={handleFile} />
      </label>

      <div className="form-actions">
        <button className="btn-primary" type="submit">Add</button>
      </div>
    </form>
  )
}
