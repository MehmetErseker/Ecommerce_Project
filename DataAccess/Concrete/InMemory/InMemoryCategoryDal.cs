//using DataAccess.Abstract;
//using Entities.Concrete;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Linq.Expressions;
//using System.Text;
//using System.Threading.Tasks;

//namespace DataAccess.Concrete.InMemory
//{
//    public class InMemoryCategoryDal : ICategoryDal
//    {
//        List<Category> categories;

//        public void Add(Category category)
//        {
//            categories.Add(category);
//        }

//        public void Delete(Category category)
//        {
//            Category categoryToDelete = null;
//            categoryToDelete = categories.SingleOrDefault(c => c.Id == category.Id);
//            categories.Remove(categoryToDelete);
//        }

//        public Category Get(Expression<Func<Category, bool>> filter)
//        {
//            throw new NotImplementedException();
//        }

//        public List<Category> GetAll()
//        {
//            return categories;
//        }

//        public List<Category> GetAll(Expression<Func<Category, bool>> filter = null)
//        {
//            throw new NotImplementedException();
//        }

//        public List<Category> GetAllWithProducts()
//        {
//            throw new NotImplementedException();
//        }

//        public Category GetById(int id)
//        {
//            throw new NotImplementedException();
//        }

//        public void Update(Category category)
//        {
//            Category categoryToUpdate = null;
//            categoryToUpdate = categories.SingleOrDefault(c => c.Id == category.Id);

//            categoryToUpdate.Name = category.Name;
//            categoryToUpdate.Products = category.Products;
//        }
//    }
//}
