#!/bin/bash

BASE_DIR="src"

create_file() {
  mkdir -p "$(dirname "$BASE_DIR/$1")"
  touch "$BASE_DIR/$1"
  echo "Created $BASE_DIR/$1"
}

# ---------------- AUTH ----------------
create_file "app/(auth)/layout.tsx"
create_file "app/(auth)/login/page.tsx"
create_file "app/(auth)/login/loading.tsx"
create_file "app/(auth)/register/page.tsx"
create_file "app/(auth)/register/loading.tsx"
create_file "app/(auth)/forgot-password/page.tsx"
create_file "app/(auth)/reset-password/page.tsx"

# ---------------- DASHBOARD AS ROOT ----------------
create_file "app/(dashboard)/layout.tsx"
create_file "app/(dashboard)/page.tsx"              # root dashboard (/)
create_file "app/(dashboard)/loading.tsx"
create_file "app/(dashboard)/components/DashboardStats.tsx"
create_file "app/(dashboard)/components/WeatherWidget.tsx"
create_file "app/(dashboard)/components/CropHealthOverview.tsx"
create_file "app/(dashboard)/components/FarmWorthCard.tsx"
create_file "app/(dashboard)/components/PriceAlerts.tsx"
create_file "app/(dashboard)/components/RecentActivities.tsx"
create_file "app/(dashboard)/components/QuickActions.tsx"

# ---------------- COOPERATIVE ----------------
create_file "app/(cooperative)/layout.tsx"
create_file "app/(cooperative)/cooperative/page.tsx"
create_file "app/(cooperative)/cooperative/members/page.tsx"
create_file "app/(cooperative)/cooperative/members/[memberId]/page.tsx"
create_file "app/(cooperative)/cooperative/farms/page.tsx"
create_file "app/(cooperative)/cooperative/farms/[farmId]/page.tsx"
create_file "app/(cooperative)/cooperative/analytics/page.tsx"
create_file "app/(cooperative)/cooperative/components/CooperativeOverview.tsx"
create_file "app/(cooperative)/cooperative/components/MembersList.tsx"
create_file "app/(cooperative)/cooperative/components/CollectiveFarms.tsx"
create_file "app/(cooperative)/cooperative/components/GroupAnalytics.tsx"

# (components/, lib/, types/, constants/, tests/ stay same as last version)
