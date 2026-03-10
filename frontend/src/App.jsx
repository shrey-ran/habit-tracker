import { useState } from "react";

const API = "http://127.0.0.1:5001";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalizeHeatmap(heatmap) {
  if (!heatmap || heatmap.length === 0) return [];

  const firstDate = new Date(heatmap[0].date);
  // getDay() returns 0 for Sunday, 1 for Monday...
  const day = firstDate.getDay(); 
  // Calculate offset for Mon-Start week: Mon(1) -> 0, Tue(2) -> 1, ..., Sun(0) -> 6
  const offset = day === 0 ? 6 : day - 1; 

  const padded = [...Array(offset).fill(null), ...heatmap];
  const weeks = [];

  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return weeks;
}

export default function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [habits, setHabits] = useState([]);
  const [habitText, setHabitText] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  // CRITICAL FIX: Changed = {} to useState({})
  const [insights, setInsights] = useState({});
  const [overall, setOverall] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justMarkedId, setJustMarkedId] = useState(null);

  const loadHabits = async (userId) => {
    const res = await fetch(`${API}/habits/${userId}`);
    setHabits(await res.json());
  };

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Original payload for login
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      setUser(data.user);
      await loadHabits(data.user._id);
      setView("dashboard");
    } catch {
      setError("Backend not reachable");
    }
    setLoading(false);
  };
    
  const createUser = async () => {
    setLoading(true);
    setError("");
    try {
      const name = email.split('@')[0] || 'User';
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }), // Payload for registration
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      
      setError("User created successfully! Please log in."); 
      setEmail("");
      setPassword("");
    } catch {
      setError("Backend not reachable");
    }
    setLoading(false);
  };

  const logout = () => {
      setUser(null);
      setHabits([]);
      setInsights({});
      setOverall(null);
      setError("");
      setEmail("");
      setPassword("");
      setView("login");
  };

  const addHabit = async () => {
    if (!habitText.trim()) return;

    const res = await fetch(`${API}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, title: habitText }),
    });

    setHabits([...habits, await res.json()]);
    setHabitText("");
  };

  const markDone = async (habitId) => {
    const date = selectedDates[habitId];
    if (!date) {
      setError("Please select a date first");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const res = await fetch(`${API}/habit/done`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, habitId, date }),
    });
    
    if (res.ok) {
        setJustMarkedId(habitId);
        setTimeout(() => setJustMarkedId(null), 2000);
        // Reload habits to see updated heatmap on next insight load
        await loadHabits(user._id); 
    } else {
        const data = await res.json();
        setError(data.message || "Failed to mark habit done.");
        setTimeout(() => setError(""), 3000);
    }
  };

  const loadInsights = async () => {
    setLoading(true);
    const map = {};
    for (let h of habits) {
      const res = await fetch(`${API}/insights/hobby/${h._id}/${user._id}`);
      map[h._id] = await res.json();
    }

    const o = await fetch(`${API}/insights/overall/${user._id}`);
    setOverall(await o.json());
    setInsights(map);
    setLoading(false);
    setView("insights");
  };

  // Shared Styles
  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    marginBottom: '0',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.3s, transform 0.1s',
    fontSize: '14px'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '420px',
    padding: '26px',
    borderRadius: '18px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(14px)',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  };

  if (view === "login") {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: #111827;
            color: white;
          }
          input[type="date"] { color-scheme: dark; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
        <div style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          background: '#111827'
        }}>
          <div style={{
            ...cardStyle,
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎯</div>
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#a78bfa',
                margin: '0 0 8px 0'
              }}>
                Habit Tracker
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>
                Build better habits, one day at a time
              </p>
            </div>

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{...inputStyle, marginBottom: '14px'}}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && login()}
              style={{...inputStyle, marginBottom: '14px'}}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />

            <button
              onClick={login}
              disabled={loading}
              style={{
                ...buttonStyle,
                width: '100%',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <button
              onClick={createUser}
              disabled={loading}
              style={{
                ...buttonStyle,
                width: '100%',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Creating User..." : "Create User"}
            </button>


            {error && (
              <p style={{
                color: error.includes("success") ? '#10b981' : '#f87171',
                textAlign: 'center',
                margin: '12px 0 0 0',
                fontSize: '0.9rem'
              }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  if (view === "dashboard") {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: #111827;
            color: white;
          }
          input[type="date"] { color-scheme: dark; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
        <div style={{
          minHeight: '100vh',
          width: '100%',
          padding: '40px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#111827'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            marginBottom: '30px',
            color: '#fff',
            textAlign: 'center'
          }}>
            Hello, {user.name} 👋
          </h2>

          {/* Add Habit Card */}
          <div style={cardStyle}>
            <h3 style={{
              fontSize: '1.2rem',
              marginBottom: '12px',
              color: '#e5e7eb'
            }}>
              ✨ New Habit
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '10px'
            }}>
              <input
                placeholder="e.g., Run 5km, Read 10 pages"
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button onClick={addHabit} style={{...buttonStyle, width: '120px'}}>
                Add
              </button>
            </div>
          </div>

          {/* Habits List */}
          {habits.length === 0 ? (
            <div style={{...cardStyle, textAlign: 'center', padding: '40px 26px'}}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
              <p style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
                No habits yet. Create your first habit above!
              </p>
            </div>
          ) : (
            habits.map((h) => (
              <div
                key={h._id}
                style={{
                  ...cardStyle,
                  border: justMarkedId === h._id ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: justMarkedId === h._id ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                <h3 style={{
                  fontSize: '1.2rem',
                  marginBottom: '12px',
                  color: '#e5e7eb'
                }}>
                  🎯 {h.title}
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  <input
                    type="date"
                    value={selectedDates[h._id] || ""}
                    onChange={(e) =>
                      setSelectedDates({ ...selectedDates, [h._id]: e.target.value })
                    }
                    style={{...inputStyle, flexGrow: 1}}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    onClick={() => markDone(h._id)}
                    style={{
                      ...buttonStyle,
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      width: 'auto',
                      padding: '12px 20px',
                      flexShrink: 0
                    }}
                  >
                    Mark Done
                  </button>
                </div>
                {justMarkedId === h._id && (
                  <div style={{
                    marginTop: '12px',
                    color: '#10b981',
                    fontWeight: '600',
                    textAlign: 'center',
                    animation: 'pulse 1s infinite'
                  }}>
                    🎉 Great job! Habit marked complete!
                  </div>
                )}
              </div>
            ))
          )}

          <div style={{ width: '100%', maxWidth: '420px', marginTop: '10px' }}>
            {/* View Insights Button */}
            {habits.length > 0 && (
              <button
                onClick={loadInsights}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  width: '100%',
                  background: 'none',
                  border: '1px solid #6366f1',
                  marginBottom: '10px',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? "Loading..." : "📊 View Insights"}
              </button>
            )}
            
            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                ...buttonStyle,
                width: '100%',
                background: 'none',
                border: '1px solid #ef4444',
                color: '#ef4444'
              }}
            >
              Sign Out
            </button>
          </div>

          {error && (
            <p style={{
              color: '#f87171',
              textAlign: 'center',
              margin: '12px 0 0 0',
              fontSize: '0.9rem',
              maxWidth: '420px'
            }}>
              {error}
            </p>
          )}
        </div>
      </>
    );
  }

  // Insights View
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background: #111827;
          color: white;
        }
        input[type="date"] { color-scheme: dark; }
        .heatmap-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .heatmap-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .heatmap-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .heatmap-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        width: '100%',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#111827'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '30px',
          color: '#fff',
          textAlign: 'center'
        }}>
          Your Progress 📈
        </h2>

        {/* Overall Stats */}
        {overall && (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              marginBottom: '12px',
              color: '#e5e7eb'
            }}>
              🏆 Overall Consistency
            </h3>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#10b981',
              marginBottom: '8px'
            }}>
              {overall.percentage}%
            </div>
            <p style={{ color: '#a78bfa', fontSize: '0.95rem', margin: 0 }}>
              You're doing amazing!
            </p>
          </div>
        )}

        {/* Habit Cards with Heatmaps */}
        {habits.map((h) => {
          const data = insights[h._id];
          if (!data) return null;

          const weeks = normalizeHeatmap(data.heatmap);

          return (
            <div key={h._id} style={{...cardStyle, maxWidth: '520px'}}>
              <h3 style={{
                fontSize: '1.2rem',
                marginBottom: '16px',
                color: '#e5e7eb'
              }}>
                🎯 {h.title}
              </h3>

              {/* Streaks */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(239, 68, 68, 0.2))',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(251, 146, 60, 0.3)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🔥</div>
                  <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: '#fb923c',
                    marginBottom: '4px'
                  }}>
                    {data.streaks.current}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    Current Streak
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🏆</div>
                  <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: '#fbbf24',
                    marginBottom: '4px'
                  }}>
                    {data.streaks.best}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    Best Streak
                  </div>
                </div>
              </div>

              {/* Heatmap Container */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '20px'
              }}>
                
                {/* Day Headers (Fixed above the scrolling weeks) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 16px)',
                  gap: '2px',
                  marginBottom: '8px',
                  width: (7 * 16) + (6 * 2) + 'px' 
                }}>
                  {DAYS.map((d) => (
                    <span key={d} style={{
                      width: '16px',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Weeks/Cells (Scrollable) */}
                <div className="heatmap-scroll" style={{
                  display: 'flex',
                  overflowX: 'auto',
                  paddingBottom: '8px'
                }}>
                  {weeks.map((week, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginRight: '2px'
                    }}>
                      {week.map((d, j) => (
                        <div
                          key={j}
                          style={{
                            width: '16px',
                            height: '16px',
                            background: d === null
                              ? 'transparent'
                              : d.value
                              ? 'linear-gradient(135deg, #10b981, #6366f1)'
                              : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '3px',
                            marginBottom: '2px',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            boxShadow: d?.value ? '0 0 5px rgba(99, 102, 241, 0.5)' : 'none'
                          }}
                          title={d ? `${d.date}: ${d.value ? "Completed ✓" : "Not completed"}` : "Not started yet"}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginTop: '12px',
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  <span>Less</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '2px'
                    }}></div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: 'linear-gradient(135deg, #10b981, #6366f1)',
                      borderRadius: '2px',
                      opacity: '0.6'
                    }}></div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: 'linear-gradient(135deg, #10b981, #6366f1)',
                      borderRadius: '2px'
                    }}></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Back Button */}
        <button
          onClick={() => setView("dashboard")}
          style={{
            ...buttonStyle,
            width: '100%',
            maxWidth: '420px',
            background: 'none',
            border: '1px solid #6366f1',
            marginTop: '10px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </>
  );
}