import DashboardLayout from "@/components/layout/DashboardLayout";
import { Construction } from "lucide-react";
import { motion } from "framer-motion";

interface ComingSoonProps {
  title: string;
  breadcrumb?: string;
}

const ComingSoon = ({ title, breadcrumb }: ComingSoonProps) => {
  return (
    <DashboardLayout title={title} breadcrumb={breadcrumb}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/50 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-8 h-8 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground">This module is coming soon. Check back later.</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;
