import React, { useState, useRef } from 'react'
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
  const [highlight, setHighlight] = useState({ top: 0, height: 0 })
  const [visible, setVisible] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const handleEntryEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!listRef.current) return
    const listRect = listRef.current.getBoundingClientRect()
    const entryRect = e.currentTarget.getBoundingClientRect()
    setHighlight({ top: entryRect.top - listRect.top, height: entryRect.height })
    setVisible(true)
  }

  return (
    <div className='section'>
      <h2>{title}</h2>
      <div className='section-entries' ref={listRef} onMouseLeave={() => setVisible(false)}>
        {React.Children.map(children, child => (
          <div className='entry-hover-wrapper' onMouseEnter={handleEntryEnter}>
            {child}
          </div>
        ))}
        <div
          className={`section-highlight${visible ? ' visible' : ''}`}
          style={{ top: highlight.top - 6, height: highlight.height + 12 }}
        />
      </div>
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
          <a className='social-icon' href='https://x.com/hrln985' target='_blank' rel='noreferrer' aria-label='X'>
            <svg viewBox='0 0 24 24' fill='currentColor'><path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/></svg>
          </a>
          <a className='social-icon' href='https://linkedin.com/in/harlenpostill' target='_blank' rel='noreferrer' aria-label='LinkedIn'>
            <svg viewBox='0 0 24 24' fill='currentColor'><path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/></svg>
          </a>
          <a className='social-icon' href='https://github.com/HarlenPostill' target='_blank' rel='noreferrer' aria-label='GitHub'>
            <svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z'/></svg>
          </a>
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
