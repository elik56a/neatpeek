import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { DesignsReviewListItemViewModel } from "../types";
import { getScoreColor } from "@/features/design-review/utils/enum-mappers";
import { ActionMenu } from "./ActionMenu";

interface GridViewProps {
  items: DesignsReviewListItemViewModel[];
  onItemClick: (id: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function GridView({ items, onItemClick, isLoading, hasMore, onLoadMore }: GridViewProps) {
  return (
    <div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12">
          <h3 className="text-lg font-semibold mb-2">No designs reviews found</h3>
          <p className="text-muted-foreground text-center">
            There are no designs reviews matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={cn(
                  "overflow-hidden transition-all duration-200 group cursor-pointer hover:shadow-lg"
                )}
              >
                {item.previewImage ? (
                  <div className="aspect-video relative group">
                    <img
                      src={item.previewImage}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={cn("font-medium text-white", getScoreColor(item.scores.total))}
                      >
                        {item.scores.total}%
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-2 transition-colors duration-200 group-hover:bg-muted/80">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No preview available</p>
                  </div>
                )}
                {/* add horisontal divder */}
                <div className="border-t border-muted/50" />
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle
                          className="text-lg truncate max-w-[160px] md:max-w-[220px]"
                          title={item.name}
                        >
                          {item.name}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        <Badge
                          variant="outline"
                          className="text-xs truncate max-w-[120px] md:max-w-[180px]"
                          title={item.brandGuideline.name}
                        >
                          {item.brandGuideline.name}
                        </Badge>
                      </CardDescription>
                    </div>
                    <ActionMenu figmaUrl={item.figmaUrl} reviewId={item.id} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </div>
                    <div>
                      <span className="font-medium">{item.issues.total}</span>{" "}
                      <span className="text-muted-foreground">issues</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={() => onItemClick(item.id)}
                    variant="outline"
                    size="sm"
                    className="w-full group/button relative overflow-hidden"
                  >
                    <span className="relative flex items-center justify-center z-10 transition-transform duration-300 group-hover/button:translate-x-1 truncate">
                      Go to Review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    <div className="absolute inset-0 bg-primary/5 transform -translate-x-full group-hover/button:translate-x-0 transition-transform duration-300" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full flex justify-center p-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </motion.div>
      )}
      {!isLoading && hasMore && onLoadMore && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            className="min-w-[120px] relative overflow-hidden group"
          >
            <span className="relative z-10">Load More</span>
            <div className="absolute inset-0 bg-primary/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </Button>
        </div>
      )}
    </div>
  );
}
