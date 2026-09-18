import { Users, Shield, Mail, Building2, UserPlus, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function AdminUsers() {
  const { user } = useAuth();

  const ROLES = [
    { label: "Students", description: "Browse, navigate, and use AI assistant", count: 1 },
    { label: "Faculty", description: "Manage their classes and office hours", count: 0 },
    { label: "Admin", description: "Full access to facilities, events, and users", count: 1 },
    { label: "IT", description: "System monitoring and technical support", count: 0 },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "1.5rem", gap: "12px" }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Users
          </h1>
          <p className="text-text-secondary" style={{ marginTop: "6px", fontSize: "13.5px" }}>
            Manage registered users and roles
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center justify-center rounded-lg font-semibold"
          style={{
            height: "40px",
            paddingLeft: "16px",
            paddingRight: "16px",
            gap: "8px",
            backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
            color: "var(--color-primary)",
            fontSize: "13px",
            cursor: "not-allowed",
            opacity: 0.7,
          }}
        >
          <UserPlus size={15} strokeWidth={2.5} />
          Invite User
        </button>
      </div>

      {/* Current user card */}
      <div
        className="relative overflow-hidden"
        style={{
          padding: "1.5rem",
          border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
          borderRadius: "1rem",
          backgroundColor: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
        }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            top: "-4rem",
            right: "-4rem",
            height: "12rem",
            width: "12rem",
            borderRadius: "9999px",
            backgroundColor: "var(--color-primary)",
            opacity: 0.06,
            filter: "blur(40px)",
          }}
        />
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--color-primary)",
            marginBottom: "1rem",
          }}
        >
          You
        </p>
        <div className="flex flex-wrap items-center" style={{ gap: "16px" }}>
          <span
            className="flex items-center justify-center rounded-full font-semibold"
            style={{
              height: "52px",
              width: "52px",
              backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
              color: "var(--color-primary)",
              fontSize: "18px",
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-text-primary" style={{ fontSize: "16px", fontWeight: 600 }}>{user?.name}</p>
            <div className="flex flex-wrap items-center" style={{ marginTop: "6px", gap: "14px" }}>
              <span className="flex items-center text-text-secondary" style={{ gap: "5px", fontSize: "12.5px" }}>
                <Mail size={11} /> {user?.email}
              </span>
              <span className="flex items-center text-text-secondary" style={{ gap: "5px", fontSize: "12.5px" }}>
                <Building2 size={11} /> {user?.organization}
              </span>
            </div>
          </div>
          <span
            className="font-mono inline-flex items-center"
            style={{
              padding: "6px 12px",
              gap: "6px",
              fontSize: "10.5px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              borderRadius: "8px",
              backgroundColor: "rgba(63,224,197,0.1)",
              color: "var(--color-primary)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            <Shield size={11} /> {user?.role}
          </span>
        </div>
      </div>

      {/* Roles overview */}
      <div style={{ marginTop: "2rem" }}>
        <h2
          className="font-mono"
          style={{
            fontSize: "10.5px",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--color-text-tertiary)",
            marginBottom: "1rem",
          }}
        >
          Roles on CampusOS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "12px" }}>
          {ROLES.map((role) => (
            <div
              key={role.label}
              style={{
                padding: "1.25rem",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--color-primary)",
                  }}
                >
                  {role.label}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {role.count}
                </span>
              </div>
              <p className="text-text-secondary" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}