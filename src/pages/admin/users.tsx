// Admin Users Management Page
// This page allows admins to manage users remotely when using external authentication

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, isSupabaseConfigured } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import PageLoadingComponent from "@/components/ui/PageLoadingComponent";
import Portal from "@/components/ui/Portal";
import styles from "@/styles/Admin.module.css";
import welcomeStyles from "@/styles/Welcome.module.css";

interface UserWithActions extends UserProfile {
  loading?: boolean;
}

export default function AdminUsers() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending">("pending");
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean | null>(
    null
  );
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(
    null
  );
  const roleDropdownRefs = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {}
  );
  const statusDropdownRefs = useRef<{
    [key: string]: HTMLButtonElement | null;
  }>({});

  useEffect(() => {
    if (!authLoading && router.isReady) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.replace("/auth/login");
        return;
      }

      checkSupabaseConfig();
    }
  }, [authLoading, isAuthenticated, user, router.isReady]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showRoleDropdown) {
        const isClickInsideDropdown =
          target.closest(`.${welcomeStyles.dropdownMenu}`) ||
          Object.values(roleDropdownRefs.current).some((ref) =>
            ref?.contains(target)
          );

        if (!isClickInsideDropdown) {
          setShowRoleDropdown(null);
        }
      }

      // Check if click is outside status dropdown
      if (showStatusDropdown) {
        const isClickInsideDropdown =
          target.closest(`.${welcomeStyles.dropdownMenu}`) ||
          Object.values(statusDropdownRefs.current).some((ref) =>
            ref?.contains(target)
          );

        if (!isClickInsideDropdown) {
          setShowStatusDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown, showStatusDropdown]);

  const checkSupabaseConfig = async () => {
    try {
      const response = await fetch("/api/admin/config-status");
      const data = await response.json();

      setSupabaseConfigured(data.configured);

      if (!data.configured) {
        setError(
          "External authentication is not configured. Please check your environment variables."
        );
        setLoading(false);
        return;
      }

      loadUsers();
    } catch (error) {
      console.error("Error checking Supabase configuration:", error);
      setError("Failed to check authentication configuration");
      setLoading(false);
    }
  };

  // Real-time updates removed to avoid direct Supabase client calls
  // Users will be refreshed when actions are performed

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsersResponse, pendingUsersResponse] = await Promise.all([
        fetch("/api/admin/users?type=all"),
        fetch("/api/admin/users?type=pending"),
      ]);

      const [allUsersData, pendingUsersData] = await Promise.all([
        allUsersResponse.json(),
        pendingUsersResponse.json(),
      ]);

      setUsers(allUsersData.users || []);
      setPendingUsers(pendingUsersData.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      // Set loading state for this user in both arrays
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action: "approve" }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reload users to reflect changes
        await loadUsers();
      } else {
        setError(data.error || "Failed to approve user");
        // Reset loading state on error
        setPendingUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
      }
    } catch (error) {
      console.error("Error approving user:", error);
      setError("Failed to approve user");
      // Reset loading state on error
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
    }
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: "admin" | "user"
  ) => {
    try {
      // Set loading state for both users and pendingUsers arrays
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action: "updateRole", role: newRole }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsers();
      } else {
        setError(data.error || "Failed to update user role");
        // Reset loading state on error
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
        setPendingUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role");
      // Reset loading state on error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
    }
  };

  const handleUpdateStatus = async (userId: string, approved: boolean) => {
    try {
      // Set loading state for both users and pendingUsers arrays
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action: "updateStatus", approved }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsers();
      } else {
        setError(data.error || "Failed to update user status");
        // Reset loading state on error
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
        setPendingUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
      // Reset loading state on error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Set loading state for both users and pendingUsers arrays
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u))
      );

      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsers();
      } else {
        setError(data.error || "Failed to delete user");
        // Reset loading state on error
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
        setPendingUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
      // Reset loading state on error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: false } : u))
      );
    }
  };

  if (authLoading || loading || supabaseConfigured === null) {
    return <PageLoadingComponent headerText="Loading Users" />;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className={styles.container}>
        <Navbar showAdminButton={false} showLogoutButton={false} />
        <div className={styles.contentWrapper}>
          <div className={styles.error}>
            <h1>Access Denied</h1>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>User Management - Admin Dashboard</title>
        <meta name="description" content="Manage users and permissions" />
      </Head>

      <div className={styles.container}>
        <Navbar showAdminButton={false} showLogoutButton={true} />

        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <h1>User Management</h1>
            <p>Manage user accounts, approvals, and permissions</p>
          </div>

          {pendingUsers.length > 0 && (
            <div className={styles.alertBanner}>
              <div className={styles.alertContent}>
                <span className={styles.alertIcon}>⚠️</span>
                <div className={styles.alertText}>
                  <strong>Action Required:</strong> {pendingUsers.length} user
                  {pendingUsers.length > 1 ? "s" : ""} waiting for approval
                </div>
                <button
                  className={styles.alertAction}
                  onClick={() => setActiveTab("pending")}
                >
                  Review Now
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
              <button
                onClick={() => setError("")}
                className={styles.closeError}
              >
                ×
              </button>
            </div>
          )}

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "pending" ? styles.active : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Approval ({pendingUsers.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Users ({users.length})
            </button>
          </div>

          <div className={styles.content}>
            {activeTab === "pending" && (
              <div className={styles.section}>
                <h2>Users Pending Approval</h2>
                {pendingUsers.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No users pending approval</p>
                  </div>
                ) : (
                  <div className={styles.userGrid}>
                    {pendingUsers.map((user) => (
                      <div key={user.id} className={styles.userCard}>
                        <div className={styles.userInfo}>
                          <h3>{user.email}</h3>
                          <p className={styles.role}>Role: {user.role}</p>
                          <p className={styles.date}>
                            Registered:{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            disabled={user.loading}
                            className={`${styles.button} ${styles.approve}`}
                          >
                            {user.loading ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.loading}
                            className={`${styles.button} ${styles.danger}`}
                          >
                            {user.loading ? "Deleting..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "all" && (
              <div className={styles.userTable}>
                <div className={styles.tableHeader}>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Registered</div>
                  <div>Actions</div>
                </div>
                {users.map((userItem) => (
                  <div key={userItem.id} className={styles.tableRow}>
                    <div className={styles.username}>{userItem.email}</div>
                    <div
                      className={styles.role}
                      style={{ position: "relative" }}
                    >
                      <button
                        ref={(el) => {
                          roleDropdownRefs.current[userItem.id] = el;
                        }}
                        onClick={() => {
                          setShowRoleDropdown(
                            showRoleDropdown === userItem.id
                              ? null
                              : userItem.id
                          );
                          setShowStatusDropdown(null);
                        }}
                        disabled={userItem.loading || userItem.id === user?.id}
                        className={`${styles.roleSelect} ${styles.selectWrapper}`}
                      >
                        {userItem.role.charAt(0).toUpperCase() +
                          userItem.role.slice(1)}
                      </button>
                      {showRoleDropdown === userItem.id && (
                        <div
                          className={welcomeStyles.dropdownMenu}
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            zIndex: 999999,
                            marginTop: "4px",
                          }}
                        >
                          {["user", "admin"].map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                handleUpdateRole(
                                  userItem.id,
                                  role as "admin" | "user"
                                );
                                setShowRoleDropdown(null);
                              }}
                              className={`${welcomeStyles.dropdownItem} ${
                                userItem.role === role
                                  ? welcomeStyles.activeDropdownItem
                                  : ""
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className={`${styles.status} ${userItem.approved ? styles.approved : styles.pending}`}
                      style={{ position: "relative" }}
                    >
                      <button
                        ref={(el) => {
                          statusDropdownRefs.current[userItem.id] = el;
                        }}
                        onClick={() => {
                          setShowStatusDropdown(
                            showStatusDropdown === userItem.id
                              ? null
                              : userItem.id
                          );
                          setShowRoleDropdown(null);
                        }}
                        disabled={userItem.loading || userItem.id === user?.id}
                        className={`${styles.statusSelect} ${styles.selectWrapper}`}
                      >
                        {userItem.approved ? "Approved" : "Pending"}
                      </button>
                      {showStatusDropdown === userItem.id && (
                        <div
                          className={welcomeStyles.dropdownMenu}
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            zIndex: 999999,
                            marginTop: "4px",
                          }}
                        >
                          {["pending", "approved"].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                handleUpdateStatus(
                                  userItem.id,
                                  status === "approved"
                                );
                                setShowStatusDropdown(null);
                              }}
                              className={`${welcomeStyles.dropdownItem} ${
                                (userItem.approved ? "approved" : "pending") ===
                                status
                                  ? welcomeStyles.activeDropdownItem
                                  : ""
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.date}>
                      {new Date(userItem.created_at).toLocaleDateString()}
                    </div>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        disabled={userItem.loading || userItem.id === user?.id} // Prevent self-deletion
                        className={`${styles.button} ${styles.small} ${styles.danger}`}
                      >
                        {userItem.loading ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              onClick={() => router.push("/")}
              className={styles.backButton}
            >
              Back to Dashboard
            </button>
            <button onClick={loadUsers} className={styles.refreshButton}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
