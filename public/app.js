// Using UMD React and ReactDOM loaded via script tags in index.html
const { useState, useEffect, createContext, useContext } = React
const ReactDOM = window.ReactDOM
const { createRoot } = ReactDOM

// Router supporting both pathname and hash. Uses history API for navigation.
function useRouter(){
  const getRoute = () => {
    const p = window.location.pathname || '/'
    if(p && p !== '/' && p !== '/index.html') return p
    const h = window.location.hash.slice(1)
    return h ? h : '/'
  }

  const [route, setRoute] = useState(getRoute)

  useEffect(()=>{
    const onPop = () => setRoute(getRoute())
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onPop) }
  },[])

  const push = (path) => {
    if(!path) path = '/'
    if(path.startsWith('#')){
      window.location.hash = path.slice(1)
      setRoute(path.slice(1) || '/')
      // notify other router instances
      window.dispatchEvent(new Event('popstate'))
      return
    }
    try{ window.history.pushState({}, '', path) }catch(e){ window.location.hash = path }
    // notify other router instances to update
    window.dispatchEvent(new Event('popstate'))
    setRoute(path)
  }

  return { route, push }
}

// DataContext
const DataContext = createContext(null)
const KEY = 'fittrack:data:v1'
function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || '{}') }catch(e){ return {} } }
function save(d){ localStorage.setItem(KEY, JSON.stringify(d)) }

function DataProvider({ children }){
  const [state, setState] = useState(() => {
    const s = load()
    return { user: s.currentUser || null, activities: s.activities || [] }
  })

  useEffect(()=>{
    const toSave = { currentUser: state.user, activities: state.activities }
    save(toSave)
  }, [state])

  const signup = (email) => {
    const user = { id: 'u_' + Math.random().toString(36).slice(2,9), email }
    setState(s => ({ ...s, user }))
    return user
  }
  const login = (email) => signup(email)
  const logout = () => setState(s => ({ ...s, user: null }))

  const addActivity = (activity) => setState(s => ({ ...s, activities: [activity, ...s.activities] }))
  const deleteActivity = (id) => setState(s => ({ ...s, activities: s.activities.filter(a=>a.id!==id) }))

  return React.createElement(DataContext.Provider, { value: { ...state, signup, login, logout, addActivity, deleteActivity } }, children)
}
function useData(){ const ctx = useContext(DataContext); if(!ctx) throw new Error('useData must be used within DataProvider'); return ctx }

// Components
function Nav(){
  const { user, logout } = useData()
  const { push } = useRouter()

  return (
    React.createElement('header', { className: 'site-nav' },
      React.createElement('div', { className: 'site-nav-inner' },
        React.createElement('a', { className: 'brand', href: '/', onClick: (e)=>{ e.preventDefault(); push('/') }}, 'FitTrack'),
        React.createElement('nav', { className: 'nav-links' },
          React.createElement('a', { className: 'nav-link', href: '/', onClick: (e)=>{ e.preventDefault(); push('/') }}, 'Home'),
          !user && React.createElement(React.Fragment, null,
            React.createElement('a', { className: 'nav-link', href: '/login', onClick: (e)=>{ e.preventDefault(); push('/login') }}, 'Login'),
            React.createElement('a', { className: 'nav-link', href: '/register', onClick: (e)=>{ e.preventDefault(); push('/register') }}, 'Register')
          ),
          user && React.createElement(React.Fragment, null,
            React.createElement('span', { className: 'nav-link muted' }, user.email),
            React.createElement('button', { className: 'nav-link btn btn-ghost', onClick: ()=>{ logout(); push('/') }}, 'Logout')
          ),
          React.createElement('a', { className: 'nav-link', href: '/dashboard', onClick: (e)=>{ e.preventDefault(); push('/dashboard') }}, 'Dashboard')
        )
      )
    )
  )
}

function Home(){
  const { push } = useRouter()
  const { user } = useData()
  return (
    React.createElement('main', { className: 'app-root' },
      React.createElement('section', { className: 'hero card' },
        React.createElement('h1', { className: 'hero-title' }, 'FitTrack'),
        React.createElement('p', { className: 'hero-sub' }, 'Your lightweight workout and progress tracker'),
        React.createElement('p', { className: 'hero-text' }, 'Prototype frontend using components and in-browser temporary storage.'),
        React.createElement('div', { className: 'cta-group' },
          !user && React.createElement(React.Fragment, null,
            React.createElement('button', { className: 'btn btn-primary', onClick: ()=> push('/register') }, 'Register'),
            React.createElement('button', { className: 'btn btn-outline', onClick: ()=> push('/login') }, 'Login')
          ),
          user && React.createElement(React.Fragment, null,
            React.createElement('span', { className: 'muted', style: { alignSelf: 'center' } }, `Signed in as ${user.email}`),
            React.createElement('button', { className: 'btn btn-ghost', onClick: ()=> push('/dashboard') }, 'Open Dashboard')
          )
        )
      )
    )
  )
}

function Auth({ mode }){
  const { signup, login, user } = useData()
  const { push } = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  useEffect(()=>{ if(user) setStatus('Logged in as ' + user.email) }, [user])

  const doSignup = () => { if(!email||!password){ alert('Provide email and password'); return } signup(email); setStatus('Signed up and logged in as '+email); setTimeout(()=> push('/dashboard'),700) }
  const doLogin = () => { if(!email||!password){ alert('Provide email and password'); return } login(email); setStatus('Logged in as '+email); setTimeout(()=> push('/dashboard'),700) }

  return (
    React.createElement('main', { className: 'app-root' },
      React.createElement('section', { className: 'card auth-card' },
        React.createElement('h1', { className: 'card-title' }, mode === 'login' ? 'Login' : (mode === 'register' ? 'Register' : 'Sign Up / Login')),
        React.createElement('p', { className: 'card-sub' }, 'Create a demo account or log in (stored in your browser).'),
        React.createElement('div', { className: 'form' },
          React.createElement('label', { className: 'label' }, 'Email', React.createElement('input', { className: 'input', type: 'email', value: email, onInput: e=> setEmail(e.target.value) })),
          React.createElement('label', { className: 'label' }, 'Password', React.createElement('input', { className: 'input', type: 'password', value: password, onInput: e=> setPassword(e.target.value) })),
          React.createElement('div', { className: 'form-actions' },
            (mode === 'login' || !mode) && React.createElement('button', { className: 'btn btn-outline', onClick: doLogin }, 'Login'),
            (mode === 'register' || !mode) && React.createElement('button', { className: 'btn btn-primary', onClick: doSignup }, 'Register')
          ),
          React.createElement('p', { className: 'status-message muted' }, status)
        )
      )
    )
  )
}

function ActivityForm(){
  const { addActivity, user } = useData()
  const [type, setType] = useState('Course')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [photoData, setPhotoData] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoData(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    if(!date || !duration){ alert('Date and duration required'); return }
    if(!user){ alert('Please sign up or login'); return }
    const act = { id: 'a_'+Math.random().toString(36).slice(2,9), type, date, duration: Number(duration), distance: Number(distance||0), photo: photoData, owner: user.id, createdAt: new Date().toISOString() }
    addActivity(act)
    setType('Course'); setDate(''); setDuration(''); setDistance(''); setPhotoData(null)
  }

  return (
    React.createElement('form', { className: 'form', onSubmit: submit },
      React.createElement('label', { className: 'label' }, 'Type', React.createElement('select', { className: 'select', value: type, onChange: e=> setType(e.target.value) },
        React.createElement('option', null, 'Course'),
        React.createElement('option', null, 'Marche'),
        React.createElement('option', null, 'Vélo'),
        React.createElement('option', null, 'Natation'),
        React.createElement('option', null, 'Gym')
      )),
      React.createElement('label', { className: 'label' }, 'Date', React.createElement('input', { className: 'input', type: 'date', value: date, onChange: e=> setDate(e.target.value), required: true })),
      React.createElement('label', { className: 'label' }, 'Durée (minutes)', React.createElement('input', { className: 'input', type: 'number', min: 0, value: duration, onChange: e=> setDuration(e.target.value), required: true })),
      React.createElement('label', { className: 'label' }, 'Distance (km)', React.createElement('input', { className: 'input', type: 'number', step: '0.01', min: 0, value: distance, onChange: e=> setDistance(e.target.value) })),
      React.createElement('label', { className: 'label' }, 'Photo', React.createElement('input', { className: 'input', type: 'file', accept: 'image/*', onChange: handleFile })),
      React.createElement('div', { className: 'form-actions' }, React.createElement('button', { className: 'btn btn-primary', type: 'submit' }, 'Add'))
    )
  )
}

function ActivityList(){
  const { activities, deleteActivity, user } = useData()
  const list = activities.filter(a => !a.owner || (user && a.owner === user.id))
  if(!list || list.length === 0) return React.createElement('p', { className: 'muted' }, 'No activities yet.')

  return (
    React.createElement('ul', { className: 'activity-list' },
      list.map(a => React.createElement('li', { key: a.id, className: 'activity-item' },
        React.createElement('div', { className: 'activity-main' },
          React.createElement('div', null,
            React.createElement('div', { className: 'activity-type' }, a.type),
            React.createElement('div', { className: 'activity-meta' }, `${a.date} • ${a.duration} min • ${a.distance || 0} km`)
          ),
          React.createElement('div', { className: 'activity-actions' }, React.createElement('button', { className: 'btn btn-ghost', onClick: ()=> deleteActivity(a.id) }, 'Delete'))
        ),
        a.photo ? React.createElement('img', { className: 'activity-photo', src: a.photo, alt: 'activity' }) : null
      ))
    )
  )
}

function Dashboard(){
  const { user } = useData()
  const { push } = useRouter()
  return (
    React.createElement('main', { className: 'app-root' },
      React.createElement('header', { className: 'dashboard-header card' },
        React.createElement('div', null, React.createElement('h2', { className: 'dashboard-title' }, 'Dashboard'), React.createElement('p', { className: 'dashboard-sub' }, 'Manage your activities (stored in your browser)')),
        React.createElement('div', { className: 'user-actions' },
          React.createElement('span', { className: 'user-email muted' }, user ? user.email : 'Guest')
        )
      ),
      React.createElement('section', { className: 'grid' },
        React.createElement('div', { className: 'panel card' }, React.createElement('h3', { className: 'panel-title' }, 'Add Activity'), React.createElement(ActivityForm, null)),
        React.createElement('div', { className: 'panel card' }, React.createElement('h3', { className: 'panel-title' }, 'Your Activities'), React.createElement(ActivityList, null))
      )
    )
  )
}

function App(){
  const { route } = useRouter()
  // Determine mode for auth routes
  const authMode = route === '/login' ? 'login' : (route === '/register' ? 'register' : null)

  return (
    React.createElement(DataProvider, null,
      React.createElement(Nav, null),
      route === '/' && React.createElement(Home, null),
      (route === '/signup' || route === '/register' || route === '/login') && React.createElement(Auth, { mode: authMode }),
      route === '/dashboard' && React.createElement(Dashboard, null),
      React.createElement('footer', { className: 'app-footer' }, '© FitTrack')
    )
  )
}

const root = createRoot(document.getElementById('root'))
root.render(React.createElement(App))
