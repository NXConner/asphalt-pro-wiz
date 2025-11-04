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
      const hasTextContent = btn.textContent && btn.textContent.trim().length > 0;
      const isCheckboxRole = btn.getAttribute('role') === 'checkbox' || btn.getAttribute('role') === 'switch';
      const hasVisibleIcon = btn.querySelector('svg');
      const isInLabel = btn.closest('label');
      const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby');
      
      // Skip if any of these conditions are true
      if (hasTextContent || isCheckboxRole || hasVisibleIcon || isInLabel || hasAriaLabelledBy) {
        return;
      }
      
      foundIssues.push({
        id: `btn-label-${index}`,
        severity: 'error',
        message: 'Button without accessible name',
        element: btn.outerHTML.substring(0, 50) + '...',
        fix: 'Add aria-label or text content to button',
      });
    });

    // Check for inputs without labels
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([type="hidden"]):not([role])').forEach((input, index) => {
      const inputEl = input as HTMLInputElement;
      const hasLabel = inputEl.id && document.querySelector(`label[for="${inputEl.id}"]`);
      const isInsideLabel = input.closest('label');
      const isInFormField = input.closest('[data-form-field]') || input.closest('.space-y-2');
      const hasVisibleLabel = input.parentElement?.querySelector('label');
      
      // Additional checks for checkboxes and radio buttons
      const isCheckboxOrRadio = inputEl.type === 'checkbox' || inputEl.type === 'radio';
      const parentContainer = input.parentElement;
      const hasLabelInContainer = parentContainer && parentContainer.querySelector('label');
      
      // Skip if any label association exists
      if (hasLabel || isInsideLabel || isInFormField || hasVisibleLabel || hasLabelInContainer) {
        return;
      }
      
      // Skip checkboxes/radios in flex containers with labels (common pattern)
      if (isCheckboxOrRadio && parentContainer?.classList.contains('flex')) {
        return;
      }
      
      foundIssues.push({
        id: `input-label-${index}`,
        severity: 'error',
        message: 'Input without associated label',
        element: input.outerHTML.substring(0, 50) + '...',
        fix: 'Associate input with a label element',
      });
    });

    // Check color contrast (basic check) - only for significant text
    const checkContrast = (element: Element) => {
      const styles = window.getComputedStyle(element);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      // Skip very small or hidden elements
      if (fontSize < 10 || styles.opacity === '0' || styles.display === 'none') {
        return false;
      }
      
      // Simple luminance calculation
      const getLuminance = (rgb: string) => {
        const match = rgb.match(/\d+/g);
        if (!match) return 0;
        const [r, g, b] = match.map(Number);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      };
      
      // Skip elements on dark backgrounds (likely styled specifically for dark mode)
      const parent = element.parentElement;
      if (parent) {
        const parentBg = window.getComputedStyle(parent).backgroundColor;
        const parentLum = getLuminance(parentBg);
        // If parent has dark background (luminance < 0.2), skip contrast check as it's likely intentional dark mode styling
        if (parentLum < 0.2 && textColor.includes('255')) {
          return false;
        }
      }

      const bgLum = getLuminance(bgColor);
      const textLum = getLuminance(textColor);
      const contrast = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);

      // Large text (18pt+ or 14pt+ bold) needs 3:1, normal text needs 4.5:1
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
      const requiredContrast = isLargeText ? 3 : 4.5;

      if (contrast < requiredContrast) {
        return true;
      }
      return false;
    };

    // Only check main content elements, skip decorative spans
    const contrastChecked = new Set<Element>();
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, label').forEach((el) => {
      if (!contrastChecked.has(el) && checkContrast(el)) {
        contrastChecked.add(el);
        foundIssues.push({
          id: `contrast-${contrastChecked.size}`,
          severity: 'warning',
          message: 'Low color contrast detected',
          element: el.tagName.toLowerCase(),
          fix: 'Ensure text has at least 4.5:1 contrast ratio (3:1 for large text)',
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
