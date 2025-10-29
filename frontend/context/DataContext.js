import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { loadData, saveData } from '../utils/storage'

const DataContext = createContext(null)

const initialState = {
  user: null,
  activities: []
}

function reducer(state, action){
  switch(action.type){
    case 'INIT':
      return { ...state, ...action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'ADD_ACTIVITY':
      return { ...state, activities: [ action.payload, ...state.activities ] }
    case 'UPDATE_ACTIVITY':
      return { ...state, activities: state.activities.map(a => a.id === action.payload.id ? action.payload : a) }
    case 'DELETE_ACTIVITY':
      return { ...state, activities: state.activities.filter(a => a.id !== action.payload) }
    default:
      return state
  }
}

function generateId(){
  return Math.random().toString(36).slice(2, 9)
}

export function DataProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState)

  // Initialize from localStorage
  useEffect(() => {
    const stored = loadData()
    if(stored){
      dispatch({ type: 'INIT', payload: stored })
    }
  }, [])

  // Persist changes
  useEffect(() => {
    saveData(state)
  }, [state])

  // Auth stubs (temporary)
  const signup = ({ email, password }) => {
    const user = { id: generateId(), email }
    dispatch({ type: 'SET_USER', payload: user })
    return user
  }

  const login = ({ email, password }) => {
    // For prototype, accept any credentials and create a user object
    const user = { id: generateId(), email }
    dispatch({ type: 'SET_USER', payload: user })
    return user
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  // Activity operations
  const addActivity = (activity) => {
    const record = { ...activity, id: generateId(), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_ACTIVITY', payload: record })
    return record
  }

  const updateActivity = (activity) => {
    dispatch({ type: 'UPDATE_ACTIVITY', payload: activity })
  }

  const deleteActivity = (id) => {
    dispatch({ type: 'DELETE_ACTIVITY', payload: id })
  }

  return (
    <DataContext.Provider value={{ ...state, signup, login, logout, addActivity, updateActivity, deleteActivity }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(){
  const ctx = useContext(DataContext)
  if(!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
