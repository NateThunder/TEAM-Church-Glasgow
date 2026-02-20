import { useEffect, useRef, useState } from 'react'

export function useServeTeamExpansion() {
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)
  const teamsContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openTeamId) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const teamsContainer = teamsContainerRef.current
      if (!teamsContainer) {
        return
      }

      const target = event.target as Node | null
      if (!target) {
        return
      }

      const clickedInsideTeamCard =
        target instanceof Element && Boolean(target.closest('.serve-team-card'))

      if (!clickedInsideTeamCard) {
        setOpenTeamId(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [openTeamId])

  useEffect(() => {
    if (!openTeamId) {
      return
    }

    const raf = requestAnimationFrame(() => {
      const teamsContainer = teamsContainerRef.current
      if (!teamsContainer) {
        return
      }

      const cards = Array.from(
        teamsContainer.querySelectorAll<HTMLElement>('.serve-team-card[data-team-id]')
      )
      const openCard = cards.find((card) => card.dataset.teamId === openTeamId)
      if (!openCard) {
        return
      }

      const rootStyles = getComputedStyle(document.documentElement)
      const headerHeight = Number.parseFloat(
        rootStyles.getPropertyValue('--header-height').trim() || '96'
      )
      const topPadding = headerHeight + 16
      const bottomPadding = 16
      const rect = openCard.getBoundingClientRect()
      const availableHeight = window.innerHeight - topPadding - bottomPadding

      if (rect.height > availableHeight || rect.top < topPadding) {
        const nextTop = window.scrollY + rect.top - topPadding
        window.scrollTo({
          top: nextTop,
          behavior: 'smooth',
        })
        return
      }

      if (rect.bottom > window.innerHeight - bottomPadding) {
        const delta = rect.bottom - (window.innerHeight - bottomPadding)
        window.scrollTo({
          top: window.scrollY + delta,
          behavior: 'smooth',
        })
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [openTeamId])

  const toggleTeam = (teamId: string) => {
    setOpenTeamId((current) => (current === teamId ? null : teamId))
  }

  return {
    openTeamId,
    teamsContainerRef,
    toggleTeam,
  }
}
