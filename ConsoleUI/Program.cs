using Business.Concrete;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using System;

namespace ConsoleUI
{
    class Program
    {
        static void Main(string[] args)
        {
            //ProductTest();
            //CategoryTest();

        }
    }
}
//        //private static void CategoryTest()
//        //{
//        //    CategoryManager categoryManager = new CategoryManager(new EfCategoryDal());
//        //    foreach (var category in categoryManager.GetAll())
//        //    {
//        //        Console.WriteLine(category.Name);
//        //    }
//        //}

//        private static void ProductTest()
//        {
//            ProductManager productManager = new ProductManager(new EfProductDal());
//            foreach (var product in productManager.GetProductDetails().Data)
//            {
//                Console.WriteLine(product.ProductName);
//            }
//        }
//    }
//}