
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, Palette, Upload, Sliders, BookOpen, FileCheck, Check } from 'lucide-react';
import { UploadDropzone } from '@/components/ui/upload-dropzone';
import { ChromePicker } from 'react-color';
import { Progress } from '@/components/ui/progress';

interface FormData {
  brandName: string;
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  logo: File | null;
  logoPreview: string | null;
  typography: {
    headingFont: string;
    bodyFont: string;
    fontPairStyle: string;
  };
  spacing: {
    unit: string;
    scale: string;
  };
  imagery: {
    style: string;
    treatment: string;
    customRules: string;
  };
}

const initialFormData: FormData = {
  brandName: '',
  description: '',
  colorPalette: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f97316',
    background: '#ffffff',
    text: '#1e293b',
  },
  logo: null,
  logoPreview: null,
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontPairStyle: 'matching',
  },
  spacing: {
    unit: '4px',
    scale: 'linear',
  },
  imagery: {
    style: 'photography',
    treatment: 'natural',
    customRules: '',
  },
};

const BrandSetup = () => {
  const [activeTab, setActiveTab] = useState<string>('basics');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    basics: false,
    colors: false,
    typography: false,
    spacing: false,
    imagery: false,
  });

  const isTabComplete = (tabName: string): boolean => !!completedSteps[tabName];

  const progressPercentage = useMemo(() => {
    const totalSteps = Object.keys(completedSteps).length;
    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    return Math.round((completedCount / totalSteps) * 100);
  }, [completedSteps]);

  const handleColorPickerToggle = (colorKey: string) => {
    setActiveColorPicker(activeColorPicker === colorKey ? null : colorKey);
  };

  const handleColorChange = (colorKey: string, color: any) => {
    setFormData((prev) => ({
      ...prev,
      colorPalette: {
        ...prev.colorPalette,
        [colorKey]: color.hex,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof FormData],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRadioChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    const tabs = ['basics', 'colors', 'typography', 'spacing', 'imagery'];
    const currentIndex = tabs.indexOf(activeTab);
    
    // Mark current tab as completed
    setCompletedSteps((prev) => ({
      ...prev,
      [activeTab]: true,
    }));
    
    // Move to next tab if available
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSave = () => {
    // Mark all tabs as completed
    const allCompleted = Object.keys(completedSteps).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setCompletedSteps(allCompleted);
    
    // Here you would typically send the data to your backend
    console.log('Brand guidelines saved:', formData);
    
    // Show success message or redirect user
    alert('Brand guidelines saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Setup</h1>
          <p className="text-muted-foreground">
            Define your brand guidelines for consistent design checks
          </p>
        </div>
        <Button onClick={handleSave} className="hover-scale">
          <Check className="h-4 w-4 mr-2" />
          Save Guidelines
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>Complete all sections to finalize your brand guidelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall completion</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <Button 
                variant={activeTab === 'basics' ? 'default' : 'outline'}
                className={`justify-start w-full ${isTabComplete('basics') ? 'border-green-500 dark:border-green-600' : ''}`}
                onClick={() => handleTabChange('basics')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Brand Basics</span>
                {isTabComplete('basics') && <CheckCircle className="h-3.5 w-3.5 ml-auto text-green-500" />}
              </Button>
              
              <Button 
                variant={activeTab === 'colors' ? 'default' : 'outline'}
                className={`justify-start w-full ${isTabComplete('colors') ? 'border-green-500 dark:border-green-600' : ''}`}
                onClick={() => handleTabChange('colors')}
              >
                <Palette className="h-4 w-4 mr-2" />
                <span>Color Palette</span>
                {isTabComplete('colors') && <CheckCircle className="h-3.5 w-3.5 ml-auto text-green-500" />}
              </Button>
              
              <Button 
                variant={activeTab === 'typography' ? 'default' : 'outline'}
                className={`justify-start w-full ${isTabComplete('typography') ? 'border-green-500 dark:border-green-600' : ''}`}
                onClick={() => handleTabChange('typography')}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                <span>Typography</span>
                {isTabComplete('typography') && <CheckCircle className="h-3.5 w-3.5 ml-auto text-green-500" />}
              </Button>
              
              <Button 
                variant={activeTab === 'spacing' ? 'default' : 'outline'}
                className={`justify-start w-full ${isTabComplete('spacing') ? 'border-green-500 dark:border-green-600' : ''}`}
                onClick={() => handleTabChange('spacing')}
              >
                <Sliders className="h-4 w-4 mr-2" />
                <span>Spacing & Scale</span>
                {isTabComplete('spacing') && <CheckCircle className="h-3.5 w-3.5 ml-auto text-green-500" />}
              </Button>
              
              <Button 
                variant={activeTab === 'imagery' ? 'default' : 'outline'}
                className={`justify-start w-full ${isTabComplete('imagery') ? 'border-green-500 dark:border-green-600' : ''}`}
                onClick={() => handleTabChange('imagery')}
              >
                <Upload className="h-4 w-4 mr-2" />
                <span>Imagery & Media</span>
                {isTabComplete('imagery') && <CheckCircle className="h-3.5 w-3.5 ml-auto text-green-500" />}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start mb-6 border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="basics"
                className={`rounded-b-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent ${
                  isTabComplete('basics') && activeTab !== 'basics' ? 'border-green-500' : ''
                }`}
              >
                Brand Basics
                {isTabComplete('basics') && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="colors"
                className={`rounded-b-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent ${
                  isTabComplete('colors') && activeTab !== 'colors' ? 'border-green-500' : ''
                }`}
              >
                Colors
                {isTabComplete('colors') && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="typography"
                className={`rounded-b-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent ${
                  isTabComplete('typography') && activeTab !== 'typography' ? 'border-green-500' : ''
                }`}
              >
                Typography
                {isTabComplete('typography') && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="spacing"
                className={`rounded-b-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent ${
                  isTabComplete('spacing') && activeTab !== 'spacing' ? 'border-green-500' : ''
                }`}
              >
                Spacing
                {isTabComplete('spacing') && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="imagery"
                className={`rounded-b-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent ${
                  isTabComplete('imagery') && activeTab !== 'imagery' ? 'border-green-500' : ''
                }`}
              >
                Imagery
                {isTabComplete('imagery') && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
              </TabsTrigger>
            </TabsList>
            
            <Card className="border-t-0 rounded-tl-none shadow-md">
              <CardContent className="pt-6">
                <TabsContent value="basics" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Brand Identity</h3>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="brandName">Brand Name *</Label>
                          <Input 
                            id="brandName" 
                            name="brandName" 
                            value={formData.brandName} 
                            onChange={handleInputChange} 
                            placeholder="e.g., TailorChecker" 
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="description">Brand Description</Label>
                          <Textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            placeholder="Describe your brand's identity, values, and voice..." 
                            rows={5} 
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Brand Logo</Label>
                          {formData.logoPreview ? (
                            <div className="relative bg-muted p-4 rounded-md flex flex-col items-center">
                              <img 
                                src={formData.logoPreview} 
                                alt="Brand Logo Preview" 
                                className="max-h-40 object-contain mb-4" 
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setFormData(prev => ({ ...prev, logo: null, logoPreview: null }))}
                              >
                                Remove Logo
                              </Button>
                            </div>
                          ) : (
                            <UploadDropzone 
                              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                              maxFiles={1}
                              maxSize={3 * 1024 * 1024}
                              onUpload={handleLogoUpload}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleNext}>
                        Next Step: Colors
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Color Palette</h3>
                      <p className="text-sm text-muted-foreground">
                        Define your brand's color system. Click on each color to choose from the color picker.
                      </p>
                      
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(formData.colorPalette).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="capitalize">{key}</Label>
                            <div 
                              className="h-12 rounded-md border cursor-pointer flex items-center justify-between p-2 transition-all hover:border-primary"
                              style={{ backgroundColor: value }}
                              onClick={() => handleColorPickerToggle(key)}
                            >
                              <span className="bg-white/90 dark:bg-black/60 text-xs px-2 py-1 rounded">
                                {value}
                              </span>
                            </div>
                            
                            {activeColorPicker === key && (
                              <div className="mt-2 z-10 relative">
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveColorPicker(null)}
                                />
                                <div className="absolute z-20">
                                  <ChromePicker 
                                    color={value} 
                                    onChange={(color) => handleColorChange(key, color)} 
                                    disableAlpha 
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <h4 className="font-medium">Preview</h4>
                      <div className="p-4 rounded-md border bg-card">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(formData.colorPalette).map(([key, value]) => (
                            <div key={key} className="space-y-1 text-center">
                              <div 
                                className="w-16 h-16 rounded-md"
                                style={{ backgroundColor: value }}
                              />
                              <p className="text-xs font-medium capitalize">{key}</p>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-3 p-3 rounded-md" style={{ backgroundColor: formData.colorPalette.background }}>
                          <h3 className="text-xl font-bold" style={{ color: formData.colorPalette.text }}>
                            Sample Heading
                          </h3>
                          <p className="text-sm" style={{ color: formData.colorPalette.text }}>
                            This is a sample paragraph to preview how your colors work together.
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              style={{ 
                                backgroundColor: formData.colorPalette.primary,
                                color: '#fff',
                                borderColor: formData.colorPalette.primary
                              }}
                            >
                              Primary
                            </Button>
                            <Button
                              variant="outline"
                              style={{ 
                                color: formData.colorPalette.secondary,
                                borderColor: formData.colorPalette.secondary
                              }}
                            >
                              Secondary
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleNext}>
                        Next Step: Typography
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="typography" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Typography Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Define the fonts and typographic styles for your brand.
                      </p>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="typography.headingFont">Heading Font</Label>
                          <Input 
                            id="typography.headingFont" 
                            name="typography.headingFont" 
                            value={formData.typography.headingFont} 
                            onChange={handleInputChange} 
                            placeholder="e.g., Inter, Poppins, etc." 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="typography.bodyFont">Body Font</Label>
                          <Input 
                            id="typography.bodyFont" 
                            name="typography.bodyFont" 
                            value={formData.typography.bodyFont} 
                            onChange={handleInputChange} 
                            placeholder="e.g., Inter, Roboto, etc." 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Font Pairing Style</Label>
                        <RadioGroup 
                          value={formData.typography.fontPairStyle}
                          onValueChange={(value) => handleRadioChange('typography', 'fontPairStyle', value)}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="matching" id="matching" />
                            <Label htmlFor="matching" className="font-normal cursor-pointer">
                              Matching (Same font family for headings and body)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="complementary" id="complementary" />
                            <Label htmlFor="complementary" className="font-normal cursor-pointer">
                              Complementary (Different fonts that work well together)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="contrasting" id="contrasting" />
                            <Label htmlFor="contrasting" className="font-normal cursor-pointer">
                              Contrasting (Distinct fonts for visual interest)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-md border bg-card">
                      <h4 className="font-medium mb-3">Typography Preview</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Heading Font: {formData.typography.headingFont}</div>
                          <h1 className="text-3xl font-bold" style={{ fontFamily: formData.typography.headingFont }}>
                            This is a Heading Example
                          </h1>
                          <h2 className="text-xl font-semibold mt-2" style={{ fontFamily: formData.typography.headingFont }}>
                            Secondary Heading Sample
                          </h2>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Body Font: {formData.typography.bodyFont}</div>
                          <p className="text-base" style={{ fontFamily: formData.typography.bodyFont }}>
                            This is an example of body text using your selected font. Good typography improves readability and enhances the user experience across your brand materials and digital products.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleNext}>
                        Next Step: Spacing
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="spacing" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Spacing & Scale</h3>
                      <p className="text-sm text-muted-foreground">
                        Define the spacing system that will be used across your designs.
                      </p>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="spacing.unit">Base Spacing Unit</Label>
                          <Input 
                            id="spacing.unit" 
                            name="spacing.unit" 
                            value={formData.spacing.unit} 
                            onChange={handleInputChange} 
                            placeholder="e.g., 4px, 8px, etc." 
                          />
                          <p className="text-xs text-muted-foreground">
                            The base unit all spacing will be calculated from
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Spacing Scale</Label>
                          <RadioGroup 
                            value={formData.spacing.scale}
                            onValueChange={(value) => handleRadioChange('spacing', 'scale', value)}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="linear" id="linear" />
                              <Label htmlFor="linear" className="font-normal cursor-pointer">
                                Linear (4, 8, 12, 16, 20, ...)
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="double" id="double" />
                              <Label htmlFor="double" className="font-normal cursor-pointer">
                                Double (4, 8, 16, 32, 64, ...)
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="custom" id="custom" />
                              <Label htmlFor="custom" className="font-normal cursor-pointer">
                                Custom Scale
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-md border bg-card">
                      <h4 className="font-medium mb-3">Spacing Preview</h4>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <div className="w-16 text-xs">Small</div>
                            <div className="h-4 bg-primary/20 rounded"></div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-xs">Medium</div>
                            <div className="h-4 bg-primary/40 rounded" style={{ width: formData.spacing.scale === 'linear' ? '32px' : '64px' }}></div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-xs">Large</div>
                            <div className="h-4 bg-primary/60 rounded" style={{ width: formData.spacing.scale === 'linear' ? '64px' : '128px' }}></div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-xs">XLarge</div>
                            <div className="h-4 bg-primary/80 rounded" style={{ width: formData.spacing.scale === 'linear' ? '96px' : '256px' }}></div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Base unit: {formData.spacing.unit} · Scale type: {formData.spacing.scale}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleNext}>
                        Next Step: Imagery
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="imagery" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Imagery & Media Guidelines</h3>
                      <p className="text-sm text-muted-foreground">
                        Define the visual style and treatment for images used across your brand.
                      </p>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Image Style</Label>
                          <RadioGroup 
                            value={formData.imagery.style}
                            onValueChange={(value) => handleRadioChange('imagery', 'style', value)}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="photography" id="photography" />
                              <Label htmlFor="photography" className="font-normal cursor-pointer">
                                Photography
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="illustration" id="illustration" />
                              <Label htmlFor="illustration" className="font-normal cursor-pointer">
                                Illustration
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mixed" id="mixed" />
                              <Label htmlFor="mixed" className="font-normal cursor-pointer">
                                Mixed Media
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Image Treatment</Label>
                          <RadioGroup 
                            value={formData.imagery.treatment}
                            onValueChange={(value) => handleRadioChange('imagery', 'treatment', value)}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="natural" id="natural" />
                              <Label htmlFor="natural" className="font-normal cursor-pointer">
                                Natural/Realistic
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="filtered" id="filtered" />
                              <Label htmlFor="filtered" className="font-normal cursor-pointer">
                                Consistent Filter/Treatment
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="duotone" id="duotone" />
                              <Label htmlFor="duotone" className="font-normal cursor-pointer">
                                Duotone/Brand Colors
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="imagery.customRules">Custom Image Rules</Label>
                        <Textarea 
                          id="imagery.customRules" 
                          name="imagery.customRules" 
                          value={formData.imagery.customRules} 
                          onChange={handleInputChange} 
                          placeholder="Any additional guidelines for imagery (e.g., subject matter, composition, etc.)" 
                          rows={4} 
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 border rounded-md overflow-hidden">
                      <div className="p-3 bg-muted font-medium text-sm">Image Style Preview</div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                              <p className="text-sm text-muted-foreground text-center p-4">
                                {formData.imagery.style === 'photography' 
                                  ? 'Photographic imagery' 
                                  : formData.imagery.style === 'illustration' 
                                  ? 'Illustrated imagery'
                                  : 'Mixed media imagery'}
                              </p>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">Style: {formData.imagery.style}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                              <p className="text-sm text-muted-foreground text-center p-4">
                                {formData.imagery.treatment === 'natural' 
                                  ? 'Natural treatment' 
                                  : formData.imagery.treatment === 'filtered' 
                                  ? 'Filtered treatment'
                                  : 'Duotone treatment'}
                              </p>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">Treatment: {formData.imagery.treatment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSave} className="hover-scale">
                        <Check className="h-4 w-4 mr-2" />
                        Save Brand Guidelines
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BrandSetup;
