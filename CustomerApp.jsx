import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  User,
  History,
  MessageSquare,
  Milk
} from 'lucide-react';
import apiService from '../lib/api';

const CustomerApp = ({ user }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  const loadDeliveryHistory = async () => {
    try {
      setLoading(true);
      // For demo purposes, we'll use mock data
      const mockDeliveries = [
        {
          id: '1',
          delivery_date: '2025-06-09',
          quantity: 2,
          status: 'Delivered',
          timestamp: '2025-06-09T08:30:00Z',
          delivery_boy: { name: 'John Delivery' },
          notes: 'Delivered at front door'
        },
        {
          id: '2',
          delivery_date: '2025-06-08',
          quantity: 2,
          status: 'Delivered',
          timestamp: '2025-06-08T08:45:00Z',
          delivery_boy: { name: 'John Delivery' },
          notes: 'Delivered to neighbor'
        },
        {
          id: '3',
          delivery_date: '2025-06-07',
          quantity: 1,
          status: 'Issue',
          timestamp: '2025-06-07T09:00:00Z',
          delivery_boy: { name: 'Mike Transport' },
          notes: 'Customer not available'
        },
        {
          id: '4',
          delivery_date: '2025-06-06',
          quantity: 2,
          status: 'Delivered',
          timestamp: '2025-06-06T08:15:00Z',
          delivery_boy: { name: 'John Delivery' },
          notes: 'Delivered successfully'
        },
        {
          id: '5',
          delivery_date: '2025-06-05',
          quantity: 2,
          status: 'Delivered',
          timestamp: '2025-06-05T08:20:00Z',
          delivery_boy: { name: 'John Delivery' },
          notes: 'Delivered at gate'
        }
      ];
      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error('Failed to load delivery history:', error);
      setError('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  const raiseIssue = async (deliveryId) => {
    try {
      // In a real app, this would open a dialog to collect issue details
      alert('Issue reporting feature would open here. This is a demo.');
      // await apiService.raiseIssue(deliveryId, issueDetails);
    } catch (error) {
      console.error('Failed to raise issue:', error);
      setError('Failed to raise issue');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Delivered': { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      'Pending': { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
      'Issue': { icon: AlertTriangle, color: 'bg-red-100 text-red-800' }
    };
    
    const config = variants[status] || { icon: Package, color: 'bg-gray-100 text-gray-800' };
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getStats = () => {
    const total = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'Delivered').length;
    const issues = deliveries.filter(d => d.status === 'Issue').length;
    const thisMonth = deliveries.filter(d => {
      const deliveryDate = new Date(d.delivery_date);
      const now = new Date();
      return deliveryDate.getMonth() === now.getMonth() && 
             deliveryDate.getFullYear() === now.getFullYear();
    }).length;
    
    return { total, delivered, issues, thisMonth };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your delivery history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Milk className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">Welcome, {user.name}</h1>
              <p className="text-blue-100 text-sm">Customer</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Account</p>
            <p className="font-semibold">Active</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
              <div className="text-xs text-gray-600">This Month</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-xs text-gray-600">Delivered</div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex-col space-y-1">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Contact Support</span>
              </Button>
              <Button variant="outline" className="h-12 flex-col space-y-1">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Schedule Delivery</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delivery History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Delivery History
          </h2>
          
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <Card key={delivery.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {new Date(delivery.delivery_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Delivered by {delivery.delivery_boy.name}
                      </p>
                    </div>
                    {getStatusBadge(delivery.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{delivery.quantity}L</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(delivery.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>

                  {delivery.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> {delivery.notes}
                      </p>
                    </div>
                  )}

                  {delivery.status === 'Delivered' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Delivery completed successfully
                      </p>
                    </div>
                  )}

                  {delivery.status === 'Issue' && (
                    <div className="space-y-2">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-red-800 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Issue reported with this delivery
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => raiseIssue(delivery.id)}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Delivery History</h3>
                <p className="text-gray-600">You don't have any delivery history yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerApp;

