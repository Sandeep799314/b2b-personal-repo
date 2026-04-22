import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import { IItineraryDay } from "@/models/Itinerary";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  dayHeader: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#E8F3FF',
    padding: 8,
  },
  event: {
    marginBottom: 10,
    padding: 8,
    borderBottom: '1 solid #eee',
  },
  highlight: {
    backgroundColor: '#f3f4f6',
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 4,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  }
});

interface ItineraryPDFProps {
  title: string;
  description: string;
  days: number;
  nights: number;
  country: string;
  highlights: string[];
  itineraryData: {
    days: IItineraryDay[];
  };
}

export const ItineraryPDFDocument = ({
  title,
  description,
  days,
  nights,
  country,
  highlights,
  itineraryData,
}: ItineraryPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{description}</Text>
        <Text style={styles.text}>{country}</Text>
        <Text style={styles.text}>{days} Days • {nights} Nights</Text>
      </View>

      {/* Highlights Section */}
      {highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.header}>Highlights</Text>
          <View style={styles.highlights}>
            {highlights.map((highlight, index) => (
              <Text key={index} style={styles.highlight}>
                {highlight}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Itinerary Days */}
      {itineraryData.days.map((day, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.dayHeader}>Day {index + 1}</Text>
          
          {/* Events */}
          {day.events.map((event, eventIndex) => (
            <View key={eventIndex} style={styles.event}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>{event.title}</Text>
              <Text style={styles.text}>{event.description}</Text>
              {event.time && <Text style={styles.text}>Time: {event.time}</Text>}
              {event.location && <Text style={styles.text}>Location: {event.location}</Text>}
            </View>
          ))}

          {/* Meals */}
          {day.meals && (
            <View style={styles.event}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>Meals</Text>
              {day.meals.breakfast && <Text style={styles.text}>Breakfast included</Text>}
              {day.meals.lunch && <Text style={styles.text}>Lunch included</Text>}
              {day.meals.dinner && <Text style={styles.text}>Dinner included</Text>}
            </View>
          )}
        </View>
      ))}
    </Page>
  </Document>
);
