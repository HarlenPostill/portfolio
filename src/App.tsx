import React from 'react'

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <h3>{title}</h3>
          <h4>{role}</h4>
        </div>
        {date && <h4 style={{ color: 'var(--text-tertiary)' }}>{date}</h4>}
      </div>
      <p>{description}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, alignSelf: 'stretch' }}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function App() {
  return (
    <div style={{ width: 600, display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: 'column', paddingTop: 120 }}>
      <h1 className='title'>HRLN interactive</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 11 }}>
        <h3 className='subtitle'>Software engineer, UI/UX designer & Game Developer</h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 18, width: 18, borderRadius: 4, backgroundColor: 'var(--text-tertiary)' }} />
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
