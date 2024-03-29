import { Injectable } from '@angular/core';
import { OrderFilter } from 'src/app/models/orders-filter';
import { environment } from 'src/environments/environment';
import { ApiService } from '../../shared';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private apiService: ApiService,) { }

  getAllOrders(filter: OrderFilter) {
    return this.apiService.request("post", `Order/GetAllOrders`, filter);
  }

  updateOrderStatus(orderNumber, orderStatus) {
    return this.apiService.request("put", `Order/updateOrderStatus?orderNumber=${orderNumber}&orderStatus=${orderStatus}`);
  }


  getOrderDetails(orderId) {
    return this.apiService.request("get", `OrderDetails/GetProductsById?OrderId=${orderId}`);
  }

  getOrder(orderId) {
    return this.apiService.request("get", `Order/GetOrderById?orderId=${orderId}`);
  }
  getAddressById(addressId) {
    return this.apiService.request("get", `AddressBook/GetAddressById/${addressId}`);
  }


}
