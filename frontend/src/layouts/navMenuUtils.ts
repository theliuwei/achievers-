import type { NavMenuNode } from '../api/navMenu'

/** 与当前路径最匹配的菜单链（用于面包屑、展开父级） */
export const findMenuTrail = (
  pathname: string,
  nodes: NavMenuNode[],
): NavMenuNode[] | null => {
  let best: NavMenuNode[] | null = null
  let bestLen = -1

  const walk = (list: NavMenuNode[], prefix: NavMenuNode[]) => {
    for (const n of list) {
      const chain = [...prefix, n]
      if (n.path) {
        if (pathname === n.path || pathname.startsWith(`${n.path}/`)) {
          if (n.path.length > bestLen) {
            bestLen = n.path.length
            best = chain
          }
        }
      }
      if (n.children?.length) {
        walk(n.children, chain)
      }
    }
  }

  walk(nodes, [])
  return best
}

export const trailToOpenKeys = (trail: NavMenuNode[] | null): string[] => {
  if (!trail || trail.length <= 1) {
    return []
  }
  return trail.slice(0, -1).map((n) => n.key)
}
