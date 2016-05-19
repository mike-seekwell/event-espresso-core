<?php
if ( ! defined( 'EVENT_ESPRESSO_VERSION' ) ) {
	exit( 'No direct script access allowed' );
}
/**
 * EE_Transaction_Test
 *
 * @package               Event Espresso
 * @subpackage
 * @author                Mike Nelson
 */



/**
 * @group core
 * @group core/db_classes
 */
class EE_Transaction_Test extends EE_UnitTestCase {

	public function test_primary_registration() {
		/** @type EE_Transaction $t */
		$t = $this->new_model_obj_with_dependencies( 'Transaction', null, false );
		EE_UnitTestCase::assertEquals( 0, $t->ID() );
		/** @type EE_Registration $r */
		$r = $this->new_model_obj_with_dependencies( 'Registration', array( 'REG_count' => 1 ), false );
		EE_UnitTestCase::assertEquals( 0, $r->ID() );
		$t->_add_relation_to( $r, 'Registration' );
		EE_UnitTestCase::assertEquals( $r, $t->primary_registration() );
		$r->save();
		EE_UnitTestCase::assertNotEquals( 0, $r->ID() );
		$in_map = EE_Registry::instance()->load_model( 'Registration' )->get_from_entity_map( $r->ID() );
		EE_UnitTestCase::assertEquals( $r, $in_map );
		EE_UnitTestCase::assertEquals( $r, $t->primary_registration() );
		EE_UnitTestCase::assertEquals( 1, $r->count() );
		$r_in_db = EE_Registry::instance()->load_model( 'Registration' )->get_one_by_ID( $r->ID() );
		EE_UnitTestCase::assertEquals( $r, $r_in_db );
		$t->save();
		EE_UnitTestCase::assertEquals( $r, $t->primary_registration() );
		//why does the above fail? because we forgot to set the registration's TXN_ID!
		//so it makes sense, but it sure would have been considerate of the transaction if,
		//when it was saved, it would have set the ID on all foreign keys pointing to it
		//on things it had cached on itself
	}



	public function test_payment_method() {
		/** @type EE_Transaction $t */
		$t = $this->new_model_obj_with_dependencies( 'Transaction' );
		EE_UnitTestCase::assertNotEquals( 0, $t->payment_method_ID() );
		$pm = $t->payment_method();
		EE_UnitTestCase::assertInstanceOf( 'EE_Payment_Method', $pm );
		//now if there is no explicit payment method on the transaction, use the first payment
		$t->set( 'PMD_ID', 0 );
		$p = $this->new_model_obj_with_dependencies( 'Payment' );
		$t->_add_relation_to( $p, 'Payment' );
		$pm = $t->payment_method();
		EE_UnitTestCase::assertInstanceOf( 'EE_Payment_Method', $pm );
	}



	/**
	 * This tests the datetime method on EE_Transaction
	 *
	 * @since 4.6
	 * @throws \EE_Error
	 */
	public function test_datetime() {
		$now = new DateTime( "now", new DateTimeZone( 'America/Vancouver' ) );
		$DateTimeZoneAbbr = $now->format( 'T' );
		// Now get the transaction's time
		$format_to_use = get_option( 'date_format' ) . ' ' . 'H:i:s';
		/** @type EE_Transaction $t */
		$t = $this->factory->transaction->create();
		$t->set_timezone( 'America/Vancouver' );
		/**
		 * just to standardize the two times because Unix timestamps are so precise, we'll use our expected
		 * time to set the time on the transaction.  This still verifies the functionality of the class.
		 * Because time comparisons will be based on seconds (Unix timestamp), let's ensure we use a
		 * format with seconds as well
		 */
		$t->set_time_format( 'H:i:s' );
		$t->set( 'TXN_timestamp', $now->format( $t->get_format( $format_to_use ) ) );
		//test getting pretty (should return formatted item in the correct timezone)
		EE_UnitTestCase::assertEquals(
			$now->format( $format_to_use ) . ' <span class="ee_dtt_timezone_string">(' . $DateTimeZoneAbbr . ')</span>',
			$t->datetime( true ),
			'datetime( true ) test'
		);
		//test getting pretty with no_html
		EE_UnitTestCase::assertEquals(
			$now->format( $format_to_use ) . ' (' . $DateTimeZoneAbbr . ')',
			$t->get_pretty( 'TXN_timestamp', 'no_html' ),
			'get_pretty, no_html test'
		);
		//test getting raw Unix timestamp
		EE_UnitTestCase::assertEquals(
			$now->format( 'U' ),
			$t->datetime( false, true ),
			'datetime( false, true) test'
		);
		//test get() (time string with offset)
		EE_UnitTestCase::assertEquals( $now->format( $format_to_use ), $t->datetime(), 'datetime() test' );
	}



	/**
	 * @throws \EE_Error
	 */
	public function test_is_locked() {
		/** @type EE_Transaction $transaction */
		$transaction = $this->factory->transaction->create();
		// initial state should be unlocked
		$locked = $transaction->get_extra_meta( 'lock', true, 0 );
		EE_UnitTestCase::assertEquals( 0, $locked );
		// is_locked() should equal $locked
		EE_UnitTestCase::assertEquals( $locked, $transaction->is_locked() );
		// set a lock
		$transaction->add_extra_meta( 'lock', time(), true );
		// now is_locked() should NOT equal $locked
		EE_UnitTestCase::assertNotEquals( $locked, $transaction->is_locked() );
		// delete existing lock
		$transaction->delete_extra_meta( 'lock' );
		// now set another lock, but with an expired timestamp
		$transaction->add_extra_meta( 'lock', time() - HOUR_IN_SECONDS , true );
		// is_locked() should remove that lock and once again equal $locked
		EE_UnitTestCase::assertEquals( $locked, $transaction->is_locked() );
	}



	public function test_lock() {
		/** @type EE_Transaction $transaction */
		$transaction = $this->factory->transaction->create();
		// initial state should be unlocked
		$locked = $transaction->get_extra_meta( 'lock', true, 0 );
		EE_UnitTestCase::assertEquals( 0, $locked );
		// now lock it
		$transaction->lock();
		$locked = $transaction->get_extra_meta( 'lock', true, 0 );
		EE_UnitTestCase::assertNotEquals( 0, $locked );
		// delete existing lock
		$transaction->delete_extra_meta( 'lock' );
		// now set another lock, but with an expired timestamp
		$expired_timestamp = time() - HOUR_IN_SECONDS;
		$transaction->add_extra_meta( 'lock', $expired_timestamp, true );
		// this time, lock() should remove the expired lock, and set a new one with a current timestamp
		$transaction->lock();
		$locked = $transaction->get_extra_meta( 'lock', true, 0 );
		EE_UnitTestCase::assertNotEquals( 0, $locked );
		EE_UnitTestCase::assertGreaterThan( $expired_timestamp, $locked );
	}



	/**
	 * @throws \EE_Error
	 */
	public function test_unlock() {
		/** @type EE_Transaction $transaction */
		$transaction = $this->factory->transaction->create();
		// initial state should be unlocked
		$locked = $transaction->get_extra_meta( 'lock', true, 0 );
		EE_UnitTestCase::assertEquals( 0, $locked );
		// set a lock
		$transaction->add_extra_meta( 'lock', time(), true );
		// unlock() should remove the above lock and return a value of 1
		EE_UnitTestCase::assertEquals( 1, $transaction->unlock() );
	}


}
// End of file EE_Transaction_Test.php
// Location:/tests/testcases/core/db_classes/EE_Transaction_Test.php