import React, { Suspense, lazy } from "react"
import { Route, Routes } from "react-router-dom"
import { type ThemeType } from "../theme/tokens"

interface AppRoutesProps {
  theme: ThemeType
  phase: number
  roleTop: string
  roleBot: string
  onScramble: () => void
}

const Home = lazy(() => import("../pages/home"))
const Portfolio = lazy(() => import("../pages/portfolio"))
const Creative = lazy(() => import("../pages/creative"))
const ProjectDetail = lazy(() => import("../pages/project-detail"))
const NotFound = lazy(() => import("../pages/not-found"))

const AppRoutes: React.FC<AppRoutesProps> = ({ theme, phase, roleTop, roleBot, onScramble }) => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              theme={theme}
              phase={phase}
              roleTop={roleTop}
              roleBot={roleBot}
              onScramble={onScramble}
            />
          }
        />
        <Route path="/portfolio" element={<Portfolio theme={theme} />} />
        <Route path="/portfolio/:projectId" element={<ProjectDetail theme={theme} />} />
        <Route path="/creative" element={<Creative theme={theme} />} />
        <Route path="*" element={<NotFound theme={theme} />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
