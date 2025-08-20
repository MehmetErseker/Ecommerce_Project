using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using Core.Entities.Concrete;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfUserDal : EfEntityRepositoryBase<User, Context>, IUserDal
    {
        //public async Task<List<User>> GetAllWithAddresses(Expression<Func<User, bool>> filter = null)
        //{
        //    using (Context context = new Context())
        //    {
        //        var query = context.Users
        //                           .Include(u => u.Addresses)
        //                           .AsQueryable();

        //        if (filter != null)
        //            query = query.Where(filter);

        //        return query.ToList();
        //    }
        //}
        public List<OperationClaim> GetClaims(User user)
        {
            using (var context = new Context())
            {
                var result = from operationClaim in context.OperationClaims
                             join userOperationClaim in context.UserOperationClaims
                                 on operationClaim.Id equals userOperationClaim.OperationClaimId
                             where userOperationClaim.UserId == user.Id
                             select new OperationClaim { Id = operationClaim.Id, Name = operationClaim.Name };
                return result.ToList();
            }

        }
        public User GetByMail(string email)
        {
            using (var context = new Context())
            {
                return context.Users.SingleOrDefault(u => u.Email == email);
            }
        }
    }

}
