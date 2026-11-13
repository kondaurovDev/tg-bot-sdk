/**
 * @module phone-frame
 * An iPhone-like frame around the chat, with a status bar whose clock
 * ticks. Below 768 px wide it steps aside and the chat fills the space.
 */
import { useEffect, useState, type ReactNode } from "react"

const clock = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" })

export interface PhoneFrameProps {
  children: ReactNode
  /** Keep the frame on narrow screens too. Default: `false`. */
  alwaysFramed?: boolean
  className?: string
}

export const PhoneFrame = ({ children, alwaysFramed = false, className }: PhoneFrameProps) => {
  const [time, setTime] = useState(clock)
  useEffect(() => {
    const timer = setInterval(() => setTime(clock()), 15_000)
    return () => clearInterval(timer)
  }, [])

  const classes = ["tgc-phone", alwaysFramed ? "tgc-phone-always" : "", className ?? ""]
  return (
    <div className={classes.filter(Boolean).join(" ")}>
      <div className="tgc-phone-screen">
        <div className="tgc-phone-notch" />
        <div className="tgc-phone-status">
          <span>{time}</span>
          <span className="tgc-phone-status-icons">
            <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor">
              <rect x="0" y="6" width="2.5" height="4" rx="0.5" />
              <rect x="4" y="4" width="2.5" height="6" rx="0.5" />
              <rect x="8" y="2" width="2.5" height="8" rx="0.5" />
              <rect x="12" y="0" width="2.5" height="10" rx="0.5" opacity="0.3" />
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor">
              <rect x="0.5" y="0.5" width="16" height="9" rx="2.5" strokeOpacity="0.4" />
              <rect x="2" y="2" width="11" height="6" rx="1.5" fill="currentColor" stroke="none" />
              <path d="M18.5 3.5v3" strokeOpacity="0.4" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        {children}
        <div className="tgc-phone-home">
          <div className="tgc-phone-home-bar" />
        </div>
      </div>
    </div>
  )
}
