import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const DesignChecker = () => {
  const [designUrl, setDesignUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState("url");
  const [htmlCode, setHtmlCode] = useState("");
  const { toast } = useToast();

  const handleUrlAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);

    // Mock analysis result
    setTimeout(() => {
      setAnalysisResult({
        accessibilityScore: 85,
        performanceScore: 72,
        seoScore: 92,
        bestPracticesScore: 78,
        errors: [
          "Missing alt text for images",
          "Low contrast text",
          "Unminified CSS",
        ],
        warnings: ["Large image sizes", "Missing meta description"],
      });
      setLoading(false);
    }, 2000);
  };

  const handleHtmlAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);

    // Mock analysis result
    setTimeout(() => {
      setAnalysisResult({
        accessibilityScore: 60,
        performanceScore: 50,
        seoScore: 60,
        bestPracticesScore: 78,
        errors: [
          "Missing alt text for images",
          "Low contrast text",
          "Unminified CSS",
        ],
        warnings: ["Large image sizes", "Missing meta description"],
      });
      setLoading(false);
    }, 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The analysis result has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Design Checker</h1>
        <p className="text-muted-foreground">
          Analyze your website's design for accessibility, performance, and SEO.
        </p>
      </div>

      <Tabs defaultValue="url" value={value} onValueChange={setValue} className="w-full">
        <TabsList>
          <TabsTrigger value="url">Analyze URL</TabsTrigger>
          <TabsTrigger value="html">Analyze HTML</TabsTrigger>
        </TabsList>
        <TabsContent value="url" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              type="url"
              value={designUrl}
              onChange={(e) => setDesignUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleUrlAnalysis} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </TabsContent>
        <TabsContent value="html" className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="html">HTML Code</Label>
            <Textarea
              id="html"
              placeholder="Paste your HTML code here"
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
            />
          </div>
          <Button onClick={handleHtmlAnalysis} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </TabsContent>
      </Tabs>

      {analysisResult && (
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Analysis Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>Overall accessibility score</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.accessibilityScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.accessibilityScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Overall performance score</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.performanceScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.performanceScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Overall SEO score</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.seoScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.seoScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
                <CardDescription>Overall best practices score</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.bestPracticesScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.bestPracticesScore}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                <AlertCircle className="mr-2 inline-block h-5 w-5" />
                Errors
              </h3>
              {analysisResult.errors.length > 0 ? (
                <ul className="list-none space-y-2">
                  {analysisResult.errors.map((error: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <Badge variant="destructive" className="mr-2">
                        Error
                      </Badge>
                      {error}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No errors found.</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">
                <AlertCircle className="mr-2 inline-block h-5 w-5 text-yellow-500" />
                Warnings
              </h3>
              {analysisResult.warnings.length > 0 ? (
                <ul className="list-none space-y-2">
                  {analysisResult.warnings.map((warning: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <Badge variant="warning" className="mr-2">
                        Warning
                      </Badge>
                      {warning}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No warnings found.</p>
              )}
            </div>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Raw Analysis Result</CardTitle>
              <CardDescription>
                Copy the raw JSON result for further analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <pre className="bg-muted rounded-md p-4 font-mono text-sm">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCopyCode} disabled={copied}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DesignChecker;
