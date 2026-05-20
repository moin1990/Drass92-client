import { useEffect } from 'react'

const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = title
      ? `${title} | IdeaVault`
      : 'IdeaVault – Startup Idea Sharing Platform'
    return () => { document.title = 'IdeaVault' }
  }, [title])
  return null
}

export default PageTitle