//using DataAccess.Abstract;
//using Entities.Concrete;
//using Entities.DTOs;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Linq.Expressions;
//using System.Text;
//using System.Threading.Tasks;

//namespace DataAccess.Concrete.InMemory
//{
//    public class InMemoryProductDal : IProductDal
//    {
//        List<Product> _products;
//        public InMemoryProductDal()
//        {
//            _products = new List<Product> { 
//                new Product { Id = 1, Name = "Laptop", CategoryId = 1, UnitPrice = 1500, UnitsInStock = 10 },
//                new Product { Id = 2, Name = "Smartphone", CategoryId = 2, UnitPrice = 800, UnitsInStock = 20 },
//                new Product { Id = 3, Name = "Tablet", CategoryId = 1, UnitPrice = 600, UnitsInStock = 15 },
//                new Product { Id = 4, Name = "Monitor", CategoryId = 2, UnitPrice = 300, UnitsInStock = 25 }
//            };
//        }

//        public void Add(Product product)
//        {
//            _products.Add(product);
//        }

//        public void Delete(Product product)
//        {
//            Product productToDelete = null;

//            productToDelete = _products.SingleOrDefault(p => p.Id == product.Id);

//            _products.Remove(productToDelete);

//        }

//        public Product Get(Expression<Func<Product, bool>> filter)
//        {
//            throw new NotImplementedException();
//        }

//        public List<Product> GetAll()
//        {
//            return _products;
//        }

//        public List<Product> GetAll(Expression<Func<Product, bool>> filter = null)
//        {
//            throw new NotImplementedException();
//        }

//        public List<Product> GetByCategoryId(int categoryId)
//        {
//            return _products.Where(p => p.CategoryId == categoryId).ToList();
//        }

//        public Product GetById(int id)
//        {
//            throw new NotImplementedException();
//        }

//        public List<ProductDetailDto> GetProductDetails()
//        {
//            throw new NotImplementedException();
//        }

//        public void Update(Product product)
//        {
//            Product productToUpdate = null;

//            productToUpdate = _products.SingleOrDefault(p => p.Id == product.Id);

//            productToUpdate.Name = product.Name;
//            productToUpdate.CategoryId = product.CategoryId;
//            productToUpdate.UnitPrice = product.UnitPrice;
//            productToUpdate.UnitsInStock = product.UnitsInStock;
//        }
            
//    }
//}
