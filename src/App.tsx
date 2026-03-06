import React from 'react'
import './App.css'

const workItems = [
  { title: 'OneTeam Services', role: 'Senior Associate Software Engineer', description: 'Innovative software solutions for Fintech enterprise collaboration and automation', date: 'Aug 2023 - Now' },
  { title: 'PantryPal', role: 'Lead Founding Engineer', description: 'Meal planning app reducing food waste with AI-powered recipe suggestions', date: 'Jun 2024 - Now' },
]

const projectItems = [
  { title: 'Guidedog vs code', role: 'Co Creator', description: 'Automatically scan code for accessibility issues and suggests fixes directly in vs code' },
  { title: 'Petal Path', role: 'Creator', description: 'Gamifies community mapping to find accessible routes for wheelchair users on iOS & android' },
  { title: 'Tiny', role: 'Creator', description: 'Extremely small browser the size of a widget for simple queries on macOS' },
  { title: 'Overshadowed', role: 'Co Creator', description: 'Puzzle game where you control a cat and its companion shadow at the same time' },
  { title: 'Narnigrams', role: 'Creator', description: 'Word game for iOS based on the game bananagrams' },
  { title: 'Feather & Bone', role: 'Creator', description: 'Puzzle game where you control a cat and its companion shadow at the same time' },
]

function Entry({ title, role, description, date }: { title: string; role: string; description: string; date?: string }) {
  return (
    <div className='entry'>
      <div className='entry-header'>
        <div className='entry-title'>
          <h3>{title}</h3>
          <h4>{role}</h4>
        </div>
        {date && <h4 className='entry-date'>{date}</h4>}
      </div>
      <p>{description}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='section'>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function App() {
  return (
    <div className='app'>
      <h1 className='title'>HRLN interactive</h1>
      <div className='header'>
        <h3 className='subtitle'>Software engineer, UI/UX designer & Game Developer</h3>
        <div className='social-icons'>
          {[0, 1, 2].map(i => (
            <div key={i} className='social-icon' />
          ))}
        </div>
      </div>
      <Section title='Work'>
        {workItems.map(item => <Entry key={item.title} {...item} />)}
      </Section>
      <Section title='Projects'>
        {projectItems.map(item => <Entry key={item.title} {...item} />)}
      </Section>
    </div>
  )
}

export default App
