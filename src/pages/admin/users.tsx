// Admin Users Management Page
// This page allows admins to manage users remotely when using external authentication

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, isSupabaseConfigured } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/ui/LogoutButton";
import styles from "@/styles/Admin.module.css";

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
    null,
  );

  useEffect(() => {
    if (!authLoading && router.isReady) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.replace("/auth/login");
        return;
      }

      checkSupabaseConfig();
    }
  }, [authLoading, isAuthenticated, user, router.isReady]);

  const checkSupabaseConfig = async () => {
    try {
      const response = await fetch("/api/admin/config-status");
      const data = await response.json();

      setSupabaseConfigured(data.configured);

      if (!data.configured) {
        setError(
          "External authentication is not configured. Please check your environment variables.",
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
      // Set loading state for this user
      setPendingUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u)),
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
        setError("Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      setError("Failed to approve user");
    }
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: "admin" | "user",
  ) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u)),
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
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role");
    }
  };

  const handleUpdateStatus = async (userId: string, approved: boolean) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u)),
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
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, loading: true } : u)),
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
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
    }
  };

  if (authLoading || loading || supabaseConfigured === null) {
    return (
      <div className={styles.container}>
        <Logo variant="default" position="absolute" />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className={styles.container}>
        <Logo variant="default" position="absolute" />
        <div className={styles.error}>
          <h1>Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
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
        <Logo variant="default" position="absolute" />
        <div className={styles.logoutContainer}>
          <LogoutButton variant="minimal" />
        </div>

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
            <button onClick={() => setError("")} className={styles.closeError}>
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
                  <div className={styles.role}>
                    <select
                      value={userItem.role}
                      onChange={(e) =>
                        handleUpdateRole(
                          userItem.id,
                          e.target.value as "admin" | "user",
                        )
                      }
                      disabled={userItem.loading || userItem.id === user?.id} // Prevent self-role change
                      className={styles.roleSelect}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div
                    className={`${styles.status} ${userItem.approved ? styles.approved : styles.pending}`}
                  >
                    <div className={styles.selectWrapper}>
                      <select
                        value={userItem.approved ? "approved" : "pending"}
                        onChange={(e) =>
                          handleUpdateStatus(
                            userItem.id,
                            e.target.value === "approved",
                          )
                        }
                        disabled={userItem.loading || userItem.id === user?.id} // Prevent self-status change
                        className={styles.statusSelect}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.date}>
                    {new Date(userItem.created_at).toLocaleDateString()}
                  </div>
                  <div className={styles.actions}>
                    {!userItem.approved && (
                      <button
                        onClick={() => handleApproveUser(userItem.id)}
                        disabled={userItem.loading}
                        className={`${styles.button} ${styles.small} ${styles.approve}`}
                      >
                        Approve
                      </button>
                    )}
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
    </>
  );
}
