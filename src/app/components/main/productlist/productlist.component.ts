import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService, Product } from 'src/app/service/product.service';
import * as _ from 'lodash'
import { environment } from 'src/environments/environment';
import { OrderService } from 'src/app/service/order.service';
import { Router } from '@angular/router';
import { DisposeBag } from '@ronas-it/dispose-bag';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.scss']
})
export class ProductlistComponent implements OnInit, OnDestroy {

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
  ) { }

  sortingObject = {
    1: { key: 'added', value: -1 },
    2: { key: 'added', value: 1 },
    3: { key: 'cost', value: -1 },
    4: { key: 'cost', value: 1 }
  }

  key: string = '';
  env = environment;
  dispBag = new DisposeBag();
  productList: Array<Product> = this.productService.getProducts();
  sortKey: string | number = 1;

  ngOnInit(): void {
    this.dispBag.add(
      this.productService.productsChanged.subscribe(
        (products: Array<Product>) => this.productList = _.cloneDeep(products)
      )
    )
  }

  ngOnDestroy(): void {
    this.dispBag.unsubscribe()
  }

  sort() {
    let sortingData: any = this.sortingObject[this.sortKey];
    let temp: any = this.productList.sort((a, b) => {
      if (sortingData['key'] == 'added') {
        let date1: any = new Date(a[sortingData['key']]);
        let date2: any = new Date(b[sortingData['key']]);
        return sortingData['value'] * (date2 - date1)
      } else {
        return sortingData['value'] * (b[sortingData['key']] - a[sortingData['key']])
      }
    })
    // console.table(temp)
  }

  buyNow(product: Product) {
    let dummy = _.cloneDeep(product)
    dummy.quantity = 1;
    if (this.productService.removeQuantity(dummy)) {
      this.orderService.addToOrder(dummy)
    } else {
      alert('out of stock !')
    }
    this.router.navigate(['/checkout']);
  }

}
