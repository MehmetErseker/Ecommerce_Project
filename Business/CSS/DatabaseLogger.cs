namespace Business.CSS
{
    public class DatabaseLogger : ILogger
    {
        public void Log()
        {
            Console.WriteLine("Veritabanı loglandı");
        }
    }
}
