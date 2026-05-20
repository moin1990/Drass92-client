const SectionHeader = ({ badge, title, description, center = true }) => (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {badge && (
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
        {title}
      </h2>
      {description && (
        <p className={`text-muted-foreground mt-3 text-base leading-relaxed ${center ? 'max-w-xl mx-auto' : 'max-w-2xl'}`}>
          {description}
        </p>
      )}
    </div>
  )
  
  export default SectionHeader