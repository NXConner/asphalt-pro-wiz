import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PREMIUM_SERVICES, STANDARD_SERVICES } from '@/lib/serviceCatalog';

export default function PremiumServiceDetails() {
  const { serviceId } = useParams<{ serviceId: string }>();
  
  const service = [...PREMIUM_SERVICES, ...STANDARD_SERVICES].find(
    s => s.id === serviceId
  );

  if (!service) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
              <Link to="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Estimator
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimator
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{service.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>

            {service.justification && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Why Premium?</h3>
                <p className="text-muted-foreground">{service.justification}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">Pricing</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-2xl font-bold">
                  ${service.defaultUnitPrice.toFixed(2)}
                  {service.unitType === 'perSqFt' && ' per sq ft'}
                  {service.unitType === 'perLinearFt' && ' per linear ft'}
                  {service.unitType === 'perUnit' && ' per unit'}
                  {service.unitType === 'flat' && ' (flat rate)'}
                </p>
              </div>
            </div>

            <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
              <h3 className="font-semibold mb-2">Professional Service</h3>
              <p className="text-sm text-muted-foreground">
                This service is performed by trained professionals with specialized equipment
                and materials to ensure the highest quality results and longevity of your pavement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}