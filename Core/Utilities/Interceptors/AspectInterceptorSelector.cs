using Castle.DynamicProxy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Core.Utilities.Interceptors
{
    public class AspectInterceptorSelector : IInterceptorSelector
    {
        public IInterceptor[] SelectInterceptors(Type type, MethodInfo method, IInterceptor[] interceptors)
        {
            // Sınıf seviyesindeki attribute'lar
            var classAttributes = type
                .GetCustomAttributes<MethodInterceptionBaseAttribute>(true)
                .ToList();

            // Metodu parametre tipleri ile bul (overload uyumu için)
            var methodInfo = type.GetMethod(
                method.Name,
                method.GetParameters().Select(p => p.ParameterType).ToArray()
            );

            // Eğer methodInfo null ise boş liste kullan
            var methodAttributes = methodInfo?
                .GetCustomAttributes<MethodInterceptionBaseAttribute>(true)
                ?? new List<MethodInterceptionBaseAttribute>();

            classAttributes.AddRange(methodAttributes);

            // Örnek: Exception log eklemek istersen buraya eklenebilir
            // classAttributes.Add(new ExceptionLogAspect(typeof(FileLogger)));

            return classAttributes.OrderBy(x => x.Priority).ToArray();
        }
    }
}
