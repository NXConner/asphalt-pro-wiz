import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface A11yIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  fix?: string;
}

/**
 * Accessibility checker component
 * Scans the page for common accessibility issues
 */
export function AccessibilityChecker() {
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showChecker, setShowChecker] = useState(false);

  const checkAccessibility = () => {
    setIsScanning(true);
    const foundIssues: A11yIssue[] = [];

    // Check for images without alt text
    document.querySelectorAll('img:not([alt])').forEach((img, index) => {
      foundIssues.push({
        id: `img-alt-${index}`,
        severity: 'error',
        message: 'Image missing alt attribute',
        element: img.outerHTML.substring(0, 50) + '...',
        fix: 'Add descriptive alt text to all images',
      });
    });

    // Check for buttons without accessible names
    document.querySelectorAll('button:not([aria-label]):not([title])').forEach((btn, index) => {
      // Skip if button has text content or is a checkbox/switch role (handled by parent label)
      const hasTextContent = btn.textContent && btn.textContent.trim().length > 0;
      const isCheckboxRole = btn.getAttribute('role') === 'checkbox' || btn.getAttribute('role') === 'switch';
      const hasVisibleIcon = btn.querySelector('svg');
      
      if (!hasTextContent && !isCheckboxRole && !hasVisibleIcon) {
        foundIssues.push({
          id: `btn-label-${index}`,
          severity: 'error',
          message: 'Button without accessible name',
          element: btn.outerHTML.substring(0, 50) + '...',
          fix: 'Add aria-label or text content to button',
        });
      }
    });

    // Check for inputs without labels
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([type="hidden"])').forEach((input, index) => {
      const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
      const isInsideLabel = input.closest('label');
      if (!hasLabel && !isInsideLabel) {
        foundIssues.push({
          id: `input-label-${index}`,
          severity: 'error',
          message: 'Input without associated label',
          element: input.outerHTML.substring(0, 50) + '...',
          fix: 'Associate input with a label element',
        });
      }
    });

    // Check color contrast (basic check)
    const checkContrast = (element: Element) => {
      const styles = window.getComputedStyle(element);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      // Simple luminance calculation
      const getLuminance = (rgb: string) => {
        const match = rgb.match(/\d+/g);
        if (!match) return 0;
        const [r, g, b] = match.map(Number);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      };

      const bgLum = getLuminance(bgColor);
      const textLum = getLuminance(textColor);
      const contrast = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);

      if (contrast < 4.5) {
        return true;
      }
      return false;
    };

    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, button').forEach((el, index) => {
      if (checkContrast(el)) {
        foundIssues.push({
          id: `contrast-${index}`,
          severity: 'warning',
          message: 'Low color contrast detected',
          element: el.tagName.toLowerCase(),
          fix: 'Ensure text has at least 4.5:1 contrast ratio',
        });
      }
    });

    // Check for proper heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      if (level > lastLevel + 1) {
        foundIssues.push({
          id: `heading-${index}`,
          severity: 'warning',
          message: `Heading level skipped from H${lastLevel} to H${level}`,
          element: heading.outerHTML.substring(0, 50) + '...',
          fix: 'Maintain proper heading hierarchy',
        });
      }
      lastLevel = level;
    });

    // Check for links without text
    document.querySelectorAll('a:not([aria-label]):empty').forEach((link, index) => {
      foundIssues.push({
        id: `link-text-${index}`,
        severity: 'error',
        message: 'Link without text or aria-label',
        element: link.outerHTML.substring(0, 50) + '...',
        fix: 'Add descriptive text or aria-label to link',
      });
    });

    setIssues(foundIssues);
    setIsScanning(false);
  };

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setShowChecker(true);
    }
  }, []);

  if (!showChecker) return null;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Accessibility Checker
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowChecker(false)}>
            ×
          </Button>
        </div>
        <CardDescription>Development tool - scans for a11y issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkAccessibility} disabled={isScanning} className="w-full">
          {isScanning ? 'Scanning...' : 'Scan Page'}
        </Button>

        {issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge variant="destructive">{errorCount} Errors</Badge>
              <Badge variant="secondary">{warningCount} Warnings</Badge>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-auto">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-lg border p-3 text-sm"
                  style={{
                    borderColor:
                      issue.severity === 'error'
                        ? 'hsl(var(--destructive))'
                        : 'hsl(var(--warning))',
                  }}
                >
                  <div className="flex items-start gap-2">
                    {issue.severity === 'error' ? (
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{issue.message}</p>
                      {issue.element && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Element: {issue.element}
                        </p>
                      )}
                      {issue.fix && (
                        <p className="text-xs text-primary mt-1">Fix: {issue.fix}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isScanning && issues.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p>No issues found. Click "Scan Page" to check.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
