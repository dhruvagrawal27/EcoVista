import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bell, Monitor, Shield, Brain, Clock, BarChart3, Smartphone, Mail, Laptop } from "lucide-react";

const sessions = [
  { device: "MacBook Pro — Chrome", location: "Campus WiFi", time: "Active now", current: true, icon: Laptop },
  { device: "iPhone 15 — Safari", location: "Mobile Data", time: "2 hrs ago", current: false, icon: Smartphone },
  { device: "Windows Desktop — Edge", location: "Office LAN", time: "Yesterday", current: false, icon: Monitor },
];

const Settings = () => (
  <DashboardLayout title="Settings" breadcrumb="System · Settings">
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="ai">AI Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16"><AvatarFallback className="text-lg bg-primary/10 text-primary">PS</AvatarFallback></Avatar>
                <div><p className="font-semibold">Dr. Priya Sharma</p><p className="text-sm text-muted-foreground">Chief Sustainability Officer</p><Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Change Avatar</Button></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ label: "Full Name", value: "Dr. Priya Sharma" }, { label: "Email", value: "priya.sharma@campus.edu" }, { label: "Phone", value: "+91 98765 43210" }, { label: "Employee ID", value: "EMP-2024-001" }].map((f, i) => (
                  <div key={i} className="space-y-1"><Label className="text-xs">{f.label}</Label><Input defaultValue={f.value} className="h-9 text-sm" /></div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">Role</Label><Select defaultValue="admin"><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Administrator</SelectItem><SelectItem value="facility">Facility Manager</SelectItem><SelectItem value="finance">Finance Lead</SelectItem><SelectItem value="faculty">Faculty</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Department</Label><Select defaultValue="sustainability"><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sustainability">Sustainability Office</SelectItem><SelectItem value="facilities">Facilities</SelectItem><SelectItem value="finance">Finance</SelectItem><SelectItem value="it">IT</SelectItem></SelectContent></Select></div>
              </div>
              <Button className="premium-button">Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4" />Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[{ label: "Critical anomaly alerts", desc: "Immediate email on critical system events", checked: true }, { label: "Daily energy summary", desc: "Morning digest of yesterday's performance", checked: true }, { label: "Weekly sustainability report", desc: "Comprehensive weekly metrics overview", checked: true }, { label: "Monthly executive brief", desc: "High-level performance summary for leadership", checked: false }, { label: "AI recommendation alerts", desc: "New optimization opportunities from AI engine", checked: true }].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4" />Push Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[{ label: "Real-time critical alerts", checked: true }, { label: "Equipment failure warnings", checked: true }, { label: "Challenge milestones", checked: false }, { label: "Community activity", checked: false }].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <p className="text-sm">{n.label}</p><Switch defaultChecked={n.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="mt-4 space-y-4">
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Display Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs">Data Density</Label>
                <Select defaultValue="comfortable"><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compact">Compact</SelectItem><SelectItem value="comfortable">Comfortable</SelectItem><SelectItem value="spacious">Spacious</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-3">
                {[{ label: "Executive Mode", desc: "Simplified view with key metrics only" }, { label: "Operational Mode", desc: "Detailed view with all data points" }, { label: "Show data confidence indicators", desc: "Display confidence scores on all metrics" }, { label: "Animate chart transitions", desc: "Smooth animations on data updates" }].map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{p.label}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                    <Switch defaultChecked={i < 2 ? false : true} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Default Dashboard Time Range</Label>
                <Select defaultValue="24h"><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1h">Last Hour</SelectItem><SelectItem value="24h">Last 24 Hours</SelectItem><SelectItem value="7d">Last 7 Days</SelectItem><SelectItem value="30d">Last 30 Days</SelectItem></SelectContent></Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label className="text-xs">Current Password</Label><Input type="password" placeholder="••••••••" className="h-9 text-sm" /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">New Password</Label><Input type="password" placeholder="••••••••" className="h-9 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Confirm Password</Label><Input type="password" placeholder="••••••••" className="h-9 text-sm" /></div>
              </div>
              <Button className="premium-button" size="sm">Update Password</Button>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div><p className="text-sm">Enable 2FA</p><p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p></div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Active Sessions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.current ? "bg-primary/5 border border-primary/10" : "bg-muted/30"}`}>
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1"><p className="text-sm font-medium">{s.device}</p><p className="text-xs text-muted-foreground">{s.location} · {s.time}</p></div>
                  {s.current ? <Badge variant="outline" className="text-xs">Current</Badge> : <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive">Revoke</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4" />AI Behavior</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between"><Label className="text-xs">Recommendation Aggressiveness</Label><span className="text-xs text-muted-foreground">Balanced</span></div>
                <Slider defaultValue={[50]} max={100} step={10} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Conservative</span><span>Balanced</span><span>Aggressive</span></div>
              </div>
              <div className="space-y-3">
                {[{ label: "Automation Suggestions", desc: "AI suggests automated interventions", checked: true }, { label: "Autonomous HVAC Control", desc: "Allow AI to make HVAC adjustments automatically", checked: false }, { label: "Predictive Maintenance Alerts", desc: "AI predicts and flags maintenance needs", checked: true }, { label: "Auto-optimize Solar Angles", desc: "AI adjusts panel tracking in real-time", checked: true }, { label: "Smart Load Balancing", desc: "AI manages building load distribution", checked: false }].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div><p className="text-sm font-medium">{p.label}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                    <Switch defaultChecked={p.checked} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">AI Model Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label className="text-xs">Preferred Forecast Model</Label><Select defaultValue="lstm"><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lstm">LSTM (Most Accurate)</SelectItem><SelectItem value="xgboost">XGBoost (Fastest)</SelectItem><SelectItem value="ensemble">Ensemble (Balanced)</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs">Confidence Threshold (%)</Label><Input type="number" defaultValue="85" className="h-9 text-sm" /></div>
              <Button className="premium-button" size="sm">Save AI Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" /><span>Last saved: 5 minutes ago</span>
        <span className="mx-2">•</span><Shield className="w-3 h-3" /><span>Encryption: AES-256</span>
      </div>
    </div>
  </DashboardLayout>
);

export default Settings;
