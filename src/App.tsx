function App() {
  return (
    <div style={{width: 600, display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: "column", paddingTop: 120}}>
      <h1 className='title'>HRLN interactive</h1>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 11}}>
        <h3 className='subtitle'>Software engineer, UI/UX designer & Game Developer</h3>
        <div style={{display: 'flex', flexDirection: 'row', gap: 12}}>
          <div style={{height: 18, width: 18, borderRadius: 4, backgroundColor: 'var(--text-tertiary)'}}/>
          <div style={{height: 18, width: 18, borderRadius: 4, backgroundColor: "var(--text-tertiary)"}}/>
          <div style={{height: 18, width: 18, borderRadius: 4, backgroundColor: "var(--text-tertiary)"}}/>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, alignSelf: 'stretch'}}>
        <h2 className='h2'>Work</h2>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch'}}>
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>OneTeam Services</h3>
            <h4 className='h4'>Senior Associate Software Engineer</h4>
          </div>
            <h4 className='h4' style={{color: 'var(--text-tertiary)'}}>Aug 2023 - Now</h4>
          </div>
          <p className='body'>Innovative software solutions for Fintech enterprise collaboration and automation</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch'}}>
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>PantryPal</h3>
            <h4 className='h4'>Lead Founding Engineer</h4>
          </div>
            <h4 className='h4' style={{color: 'var(--text-tertiary)'}}>Jun 2024 - Now</h4>
          </div>
          <p className='body'>Meal planning app reducing food waste with AI-powered recipe suggestions</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, alignSelf: 'stretch'}}>
        <h2 className='h2'>Projects</h2>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>Guidedog vs code</h3>
            <h4 className='h4'>Co Creator</h4>
          </div>
          <p className='body'>Automatically scan code for accessibility issues and suggests fixes directly in vs code</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>Petal Path</h3>
            <h4 className='h4'>Creator</h4>
          </div>
          <p className='body'>Gamifies community mapping to find accessible routes for wheelchair users on iOS & android</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>Tiny</h3>
            <h4 className='h4'>Creator</h4>
          </div>
          <p className='body'>Extremely small browser the size of a widget for simple queries on macOS</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>Overshadowed</h3>
            <h4 className='h4'>Co Creator</h4>
          </div>
          <p className='body'>Puzzle game where you control a cat and its companion shadow at the same time</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>Narnigrams</h3>
            <h4 className='h4'>Creator</h4>
          </div>
          <p className='body'>Word game for iOS based on the game bananagrams</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, alignSelf: 'stretch'}}>        
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <h3 className='h3'>Feather & Bone</h3>
            <h4 className='h4'>Creator</h4>
          </div>
          <p className='body'>Puzzle game where you control a cat and its companion shadow at the same time</p>
        </div>
      </div>
    </div>
  )
}

export default App
